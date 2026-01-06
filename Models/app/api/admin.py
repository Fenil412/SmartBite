"""
Admin API endpoints for Flask AI service
Provides direct admin access to all AI collections
"""

from flask import Blueprint, request, jsonify, send_file, make_response
from datetime import datetime, timedelta
import json
import pandas as pd
import io
import hmac
import hashlib
import time
import os
from functools import wraps
from bson import ObjectId
from ..db.mongo import db

admin_bp = Blueprint('admin', __name__)

# Auth configuration
SECRET = os.getenv("INTERNAL_HMAC_SECRET", "JOu0USVT1q5kN1wkclAttRKWA8LaxMzW")
ALLOWED_DRIFT = 300  # 5 minutes

def get_db_connection():
    """Get database connection"""
    return db

def require_internal_auth(f):
    """Decorator to require internal authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        timestamp = request.headers.get("x-timestamp")
        signature = request.headers.get("x-signature")

        if not timestamp or not signature:
            return jsonify({"error": "Missing authentication headers"}), 401

        # Check time drift
        now = int(time.time())
        timestamp_int = int(timestamp)
        time_diff = abs(now - timestamp_int)
        
        if time_diff > ALLOWED_DRIFT:
            return jsonify({"error": f"Request expired (time diff: {time_diff}s)"}), 401

        body = request.get_data(as_text=True)

        expected = hmac.new(
            SECRET.encode(),
            (timestamp + body).encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected, signature):
            return jsonify({"error": "Invalid signature"}), 401

        return f(*args, **kwargs)
    return decorated_function

def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = [serialize_doc(item) if isinstance(item, dict) else item for item in value]
            else:
                result[key] = value
        return result
    return doc

def get_user_info(user_id):
    """Get user information by user ID"""
    try:
        db = get_db_connection()
        users_collection = db['users']
        
        # Try to find user by different fields
        user = (users_collection.find_one({"_id": user_id}) or 
                users_collection.find_one({"username": user_id}) or
                users_collection.find_one({"email": user_id}))
        
        if user:
            username = user.get('username', '')
            email = user.get('email', '')
            full_name = user.get('fullName') or user.get('name') or ''
            
            # Create display name priority: fullName > username > email > 'Unknown User'
            display_name = full_name or username or email.split('@')[0] if email else 'Unknown User'
            
            return {
                'username': username,
                'email': email,
                'fullName': full_name,
                'name': display_name
            }
        
        # If no user found, return user_id as fallback
        return {
            'username': user_id if user_id else 'Unknown',
            'email': '',
            'fullName': '',
            'name': user_id if user_id else 'Unknown User'
        }
    except Exception as e:
        # Error in get_user_info - using fallback
        return {
            'username': user_id if user_id else 'Unknown',
            'email': '',
            'fullName': '',
            'name': user_id if user_id else 'Unknown User'
        }

def enrich_with_user_info(records):
    """Enrich records with user information"""
    enriched_records = []
    
    for record in records:
        enriched_record = record.copy()
        user_id = record.get('userId')
        
        if user_id:
            user_info = get_user_info(user_id)
            enriched_record.update({
                'username': user_info['username'],
                'userEmail': user_info['email'],
                'userFullName': user_info['fullName'],
                'userName': user_info['name']  # Display name
            })
        else:
            enriched_record.update({
                'username': 'Unknown',
                'userEmail': '',
                'userFullName': '',
                'userName': 'Unknown User'
            })
            
        enriched_records.append(enriched_record)
    
    return enriched_records

@admin_bp.route('/ai-history', methods=['GET'])
@require_internal_auth
def get_all_ai_history():
    """Get all AI history records with user information"""
    try:
        db = get_db_connection()
        history_collection = db['ai_history']
        
        # Get all AI history records
        ai_history = list(history_collection.find().sort("createdAt", -1).limit(1000))
        
        # Serialize documents
        serialized_history = [serialize_doc(doc) for doc in ai_history]
        
        # Enrich with user information
        enriched_history = enrich_with_user_info(serialized_history)
        
        return jsonify({
            'success': True,
            'data': enriched_history,
            'count': len(enriched_history)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get AI history: {str(e)}'
        }), 500

@admin_bp.route('/health-reports', methods=['GET'])
@require_internal_auth
def get_all_health_reports():
    """Get all health risk reports with user information"""
    try:
        db = get_db_connection()
        
        # Get from both health_risk_reports collection and ai_history
        health_reports = []
        
        # First, get from dedicated health_risk_reports collection
        health_reports_collection = db['health_risk_reports']
        dedicated_reports = list(
            health_reports_collection.find()
            .sort("createdAt", -1)
            .limit(1000)
        )
        health_reports.extend(dedicated_reports)
        
        # Then, get from ai_history collection with health report filters
        history_collection = db['ai_history']
        history_reports = list(
            history_collection.find({
                "$or": [
                    {"action": "health_risk_report"},
                    {"type": "health_risk_report"},
                    {"action": "health_report"},
                    {"type": "health_report"},
                    {"action": "health_assessment"},
                    {"type": "health_assessment"}
                ]
            })
            .sort("createdAt", -1)
            .limit(1000)
        )
        health_reports.extend(history_reports)
        
        # Remove duplicates based on _id
        seen_ids = set()
        unique_reports = []
        for report in health_reports:
            report_id = str(report.get('_id'))
            if report_id not in seen_ids:
                seen_ids.add(report_id)
                unique_reports.append(report)
        
        # Sort by createdAt descending (handle mixed datetime/string types)
        def safe_sort_key(record):
            created_at = record.get('createdAt', '')
            if isinstance(created_at, str):
                return created_at
            elif hasattr(created_at, 'isoformat'):
                return created_at.isoformat()
            else:
                return str(created_at)
        
        unique_reports.sort(key=safe_sort_key, reverse=True)
        
        # Serialize documents
        serialized_reports = [serialize_doc(doc) for doc in unique_reports]
        
        # Enrich with user information
        enriched_reports = enrich_with_user_info(serialized_reports)
        
        return jsonify({
            'success': True,
            'data': enriched_reports,
            'count': len(enriched_reports)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get health reports: {str(e)}'
        }), 500

@admin_bp.route('/meal-analysis', methods=['GET'])
@require_internal_auth
def get_all_meal_analysis():
    """Get all meal analysis records with user information"""
    try:
        db = get_db_connection()
        
        # Get from both meal_analysis collection and ai_history
        meal_analysis = []
        
        # First, get from dedicated meal_analysis collection
        meal_analysis_collection = db['meal_analysis']
        dedicated_analysis = list(
            meal_analysis_collection.find()
            .sort("createdAt", -1)
            .limit(1000)
        )
        meal_analysis.extend(dedicated_analysis)
        
        # Then, get from ai_history collection with meal analysis filters
        history_collection = db['ai_history']
        history_analysis = list(
            history_collection.find({
                "$or": [
                    {"action": "meal_analysis"},
                    {"type": "meal_analysis"},
                    {"action": "analyze_meal"},
                    {"type": "analyze_meal"},
                    {"action": "analyze_meals"},
                    {"type": "analyze_meals"},
                    {"action": "nutrition_analysis"},
                    {"type": "nutrition_analysis"},
                    {"action": "nutrition_summary"},
                    {"type": "nutrition_summary"},
                    {"action": "nutrition_impact_summary"},
                    {"type": "nutrition_impact_summary"}
                ]
            })
            .sort("createdAt", -1)
            .limit(1000)
        )
        meal_analysis.extend(history_analysis)
        
        # Remove duplicates based on _id
        seen_ids = set()
        unique_analysis = []
        for analysis in meal_analysis:
            analysis_id = str(analysis.get('_id'))
            if analysis_id not in seen_ids:
                seen_ids.add(analysis_id)
                unique_analysis.append(analysis)
        
        # Sort by createdAt descending (handle mixed datetime/string types)
        def safe_sort_key(record):
            created_at = record.get('createdAt', '')
            if isinstance(created_at, str):
                return created_at
            elif hasattr(created_at, 'isoformat'):
                return created_at.isoformat()
            else:
                return str(created_at)
        
        unique_analysis.sort(key=safe_sort_key, reverse=True)
        
        # Serialize documents
        serialized_analysis = [serialize_doc(doc) for doc in unique_analysis]
        
        # Enrich with user information
        enriched_analysis = enrich_with_user_info(serialized_analysis)
        
        return jsonify({
            'success': True,
            'data': enriched_analysis,
            'count': len(enriched_analysis)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get meal analysis: {str(e)}'
        }), 500

@admin_bp.route('/weekly-plans', methods=['GET'])
@require_internal_auth
def get_all_weekly_plans():
    """Get all AI weekly plans with user information"""
    try:
        db = get_db_connection()
        
        # Get from both weekly_plans collection and ai_history
        weekly_plans = []
        
        # First, get from dedicated weekly_plans collection
        weekly_plans_collection = db['weekly_plans']
        dedicated_plans = list(
            weekly_plans_collection.find()
            .sort("createdAt", -1)
            .limit(1000)
        )
        weekly_plans.extend(dedicated_plans)
        
        # Then, get from ai_history collection with weekly plan filters
        history_collection = db['ai_history']
        history_plans = list(
            history_collection.find({
                "$or": [
                    {"action": "weekly_plan"},
                    {"type": "weekly_plan"},
                    {"action": "generate_weekly_plan"},
                    {"type": "generate_weekly_plan"},
                    {"action": "meal_plan"},
                    {"type": "meal_plan"},
                    {"type": "weekly_plan_v3"},
                    {"action": "weekly_plan_v3"},
                    {"action": "meal_planning"},
                    {"type": "meal_planning"},
                    {"action": "Summarize weekly meal"},
                    {"type": "Summarize weekly meal"}
                ]
            })
            .sort("createdAt", -1)
            .limit(1000)
        )
        weekly_plans.extend(history_plans)
        
        # Remove duplicates based on _id
        seen_ids = set()
        unique_plans = []
        for plan in weekly_plans:
            plan_id = str(plan.get('_id'))
            if plan_id not in seen_ids:
                seen_ids.add(plan_id)
                unique_plans.append(plan)
        
        # Sort by createdAt descending (handle mixed datetime/string types)
        def safe_sort_key(record):
            created_at = record.get('createdAt', '')
            if isinstance(created_at, str):
                return created_at
            elif hasattr(created_at, 'isoformat'):
                return created_at.isoformat()
            else:
                return str(created_at)
        
        unique_plans.sort(key=safe_sort_key, reverse=True)
        
        # Serialize documents
        serialized_plans = [serialize_doc(doc) for doc in unique_plans]
        
        # Enrich with user information
        enriched_plans = enrich_with_user_info(serialized_plans)
        
        return jsonify({
            'success': True,
            'data': enriched_plans,
            'count': len(enriched_plans)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get weekly plans: {str(e)}'
        }), 500

@admin_bp.route('/chat-history', methods=['GET'])
@require_internal_auth
def get_all_chat_history():
    """Get all AI chat history with user information"""
    try:
        db = get_db_connection()
        
        # Get from ai_history collection with chat filters
        history_collection = db['ai_history']
        chat_history = list(
            history_collection.find({
                "$or": [
                    {"action": "chat"},
                    {"type": "chat"},
                    {"action": "conversation"},
                    {"type": "conversation"},
                    {"action": "nutritionist_chat"},
                    {"type": "nutritionist_chat"}
                ]
            })
            .sort("createdAt", -1)
            .limit(1000)
        )
        
        # Serialize documents
        serialized_chats = [serialize_doc(doc) for doc in chat_history]
        
        # Enrich with user information
        enriched_chats = enrich_with_user_info(serialized_chats)
        
        return jsonify({
            'success': True,
            'data': enriched_chats,
            'count': len(enriched_chats)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get chat history: {str(e)}'
        }), 500

@admin_bp.route('/user-context', methods=['GET'])
@require_internal_auth
def get_all_user_context():
    """Get all user context records with user information"""
    try:
        db = get_db_connection()
        user_context_collection = db['user_context']
        
        # Get all user context records
        user_context = list(user_context_collection.find().sort("updatedAt", -1).limit(1000))
        
        # Serialize documents
        serialized_context = [serialize_doc(doc) for doc in user_context]
        
        # Enrich with user information
        enriched_context = enrich_with_user_info(serialized_context)
        
        return jsonify({
            'success': True,
            'data': enriched_context,
            'count': len(enriched_context)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get user context: {str(e)}'
        }), 500

@admin_bp.route('/dashboard-stats', methods=['GET'])
@require_internal_auth
def get_dashboard_stats():
    """Get aggregated dashboard statistics"""
    try:
        db = get_db_connection()
        
        # Get counts from all collections
        history_collection = db['ai_history']
        user_context_collection = db['user_context']
        health_reports_collection = db['health_risk_reports']
        meal_analysis_collection = db['meal_analysis']
        weekly_plans_collection = db['weekly_plans']
        
        # Count different types of AI interactions
        total_interactions = history_collection.count_documents({})
        
        # Count by type field (preferred) and action field (fallback)
        chat_count = (history_collection.count_documents({"type": "chat"}) + 
                     history_collection.count_documents({"action": "chat"}))
        
        # Count from dedicated collections first, then fallback to ai_history
        meal_analysis_count = (meal_analysis_collection.count_documents({}) + 
                              history_collection.count_documents({"type": "meal_analysis"}) +
                              history_collection.count_documents({"action": "meal_analysis"}))
        
        weekly_plans_count = (weekly_plans_collection.count_documents({}) +
                             history_collection.count_documents({"type": "weekly_plan"}) +
                             history_collection.count_documents({"action": "weekly_plan"}))
        
        health_reports_count = (health_reports_collection.count_documents({}) +
                               history_collection.count_documents({"type": "health_risk_report"}) +
                               history_collection.count_documents({"action": "health_risk_report"}))
        
        user_context_count = user_context_collection.count_documents({})
        
        # Calculate time-based statistics
        now = datetime.utcnow()
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)
        
        # Count recent interactions (try both ISO string and datetime formats)
        recent_7_days = (history_collection.count_documents({
            "createdAt": {"$gte": seven_days_ago.isoformat()}
        }) + history_collection.count_documents({
            "createdAt": {"$gte": seven_days_ago}
        }))
        
        recent_30_days = (history_collection.count_documents({
            "createdAt": {"$gte": thirty_days_ago.isoformat()}
        }) + history_collection.count_documents({
            "createdAt": {"$gte": thirty_days_ago}
        }))
        
        stats = {
            'aiInteractions': {
                'total': total_interactions,
                'byType': {
                    'chat': chat_count,
                    'meal_analysis': meal_analysis_count,
                    'weekly_plan': weekly_plans_count,
                    'health_risk_report': health_reports_count
                },
                'last7Days': recent_7_days,
                'last30Days': recent_30_days
            },
            'chatActivity': {
                'totalMessages': chat_count,
                'averageLength': 150  # Placeholder
            },
            'weeklyPlans': {
                'total': weekly_plans_count
            },
            'healthReports': {
                'total': health_reports_count
            },
            'userContext': {
                'total': user_context_count
            },
            'generatedAt': datetime.utcnow().isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get dashboard stats: {str(e)}'
        }), 500

@admin_bp.route('/delete-record', methods=['DELETE'])
@require_internal_auth
def delete_record():
    """Delete a specific AI record"""
    try:
        data = request.get_json()
        record_id = data.get('recordId')
        collection_name = data.get('collection')
        
        if not record_id or not collection_name:
            return jsonify({'error': 'recordId and collection are required'}), 400
        
        db = get_db_connection()
        
        # Map collection names to actual collections
        collection_map = {
            'ai_history': 'ai_history',
            'health_risk_reports': 'ai_history',  # These are stored in ai_history
            'meal_analysis': 'ai_history',        # These are stored in ai_history
            'weekly_plans': 'ai_history',         # These are stored in ai_history
            'chat_history': 'ai_history',         # These are stored in ai_history
            'user_context': 'user_context'
        }
        
        actual_collection = collection_map.get(collection_name)
        if not actual_collection:
            return jsonify({'error': 'Invalid collection name'}), 400
        
        collection = db[actual_collection]
        
        # Delete the record
        result = collection.delete_one({"_id": ObjectId(record_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Record not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Record deleted successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to delete record: {str(e)}'
        }), 500

@admin_bp.route('/export-data', methods=['POST'])
@require_internal_auth
def export_data():
    """Export AI data for admin"""
    try:
        data = request.get_json()
        collection_name = data.get('collection', 'all')
        export_format = data.get('format', 'excel')
        
        db = get_db_connection()
        
        # Prepare export data with user enrichment
        export_data = {}
        
        if collection_name == 'all' or collection_name == 'ai-history':
            history_collection = db['ai_history']
            ai_history = list(history_collection.find().sort("createdAt", -1))
            serialized_history = [serialize_doc(doc) for doc in ai_history]
            export_data['ai_history'] = enrich_with_user_info(serialized_history)
        
        if collection_name == 'all' or collection_name == 'health-reports':
            # Get from health_risk_reports collection first, then ai_history as fallback
            health_reports_collection = db['health_risk_reports']
            health_reports = list(health_reports_collection.find().sort("createdAt", -1))
            
            # Also get from ai_history with comprehensive filters
            history_collection = db['ai_history']
            history_reports = list(history_collection.find({
                "$or": [
                    {"action": "health_risk_report"},
                    {"type": "health_risk_report"},
                    {"action": "health_report"},
                    {"type": "health_report"},
                    {"action": "health_assessment"},
                    {"type": "health_assessment"}
                ]
            }).sort("createdAt", -1))
            
            # Combine and remove duplicates
            all_reports = health_reports + history_reports
            seen_ids = set()
            unique_reports = []
            for report in all_reports:
                report_id = str(report.get('_id'))
                if report_id not in seen_ids:
                    seen_ids.add(report_id)
                    unique_reports.append(report)
            
            serialized_reports = [serialize_doc(doc) for doc in unique_reports]
            export_data['health_reports'] = enrich_with_user_info(serialized_reports)
        
        if collection_name == 'all' or collection_name == 'meal-analysis':
            # Get from meal_analysis collection first, then ai_history as fallback
            meal_analysis_collection = db['meal_analysis']
            meal_analysis = list(meal_analysis_collection.find().sort("createdAt", -1))
            
            # Also get from ai_history with comprehensive filters
            history_collection = db['ai_history']
            history_analysis = list(history_collection.find({
                "$or": [
                    {"action": "meal_analysis"},
                    {"type": "meal_analysis"},
                    {"action": "analyze_meal"},
                    {"type": "analyze_meal"},
                    {"action": "analyze_meals"},
                    {"type": "analyze_meals"},
                    {"action": "nutrition_analysis"},
                    {"type": "nutrition_analysis"},
                    {"action": "nutrition_summary"},
                    {"type": "nutrition_summary"},
                    {"action": "nutrition_impact_summary"},
                    {"type": "nutrition_impact_summary"}
                ]
            }).sort("createdAt", -1))
            
            # Combine and remove duplicates
            all_analysis = meal_analysis + history_analysis
            seen_ids = set()
            unique_analysis = []
            for analysis in all_analysis:
                analysis_id = str(analysis.get('_id'))
                if analysis_id not in seen_ids:
                    seen_ids.add(analysis_id)
                    unique_analysis.append(analysis)
            
            serialized_analysis = [serialize_doc(doc) for doc in unique_analysis]
            export_data['meal_analysis'] = enrich_with_user_info(serialized_analysis)
        
        if collection_name == 'all' or collection_name == 'weekly-plans':
            # Get from weekly_plans collection first, then ai_history as fallback
            weekly_plans_collection = db['weekly_plans']
            weekly_plans = list(weekly_plans_collection.find().sort("createdAt", -1))
            
            # Also get from ai_history with comprehensive filters
            history_collection = db['ai_history']
            history_plans = list(history_collection.find({
                "$or": [
                    {"action": "weekly_plan"},
                    {"type": "weekly_plan"},
                    {"action": "generate_weekly_plan"},
                    {"type": "generate_weekly_plan"},
                    {"action": "meal_plan"},
                    {"type": "meal_plan"},
                    {"type": "weekly_plan_v3"},
                    {"action": "weekly_plan_v3"},
                    {"action": "meal_planning"},
                    {"type": "meal_planning"},
                    {"action": "Summarize weekly meal"},
                    {"type": "Summarize weekly meal"}
                ]
            }).sort("createdAt", -1))
            
            # Combine and remove duplicates
            all_plans = weekly_plans + history_plans
            seen_ids = set()
            unique_plans = []
            for plan in all_plans:
                plan_id = str(plan.get('_id'))
                if plan_id not in seen_ids:
                    seen_ids.add(plan_id)
                    unique_plans.append(plan)
            
            serialized_plans = [serialize_doc(doc) for doc in unique_plans]
            export_data['weekly_plans'] = enrich_with_user_info(serialized_plans)
        
        if collection_name == 'all' or collection_name == 'chat-history':
            history_collection = db['ai_history']
            chat_history = list(history_collection.find({
                "$or": [
                    {"action": "chat"},
                    {"type": "chat"},
                    {"action": "conversation"},
                    {"type": "conversation"},
                    {"action": "nutritionist_chat"},
                    {"type": "nutritionist_chat"}
                ]
            }).sort("createdAt", -1))
            serialized_chats = [serialize_doc(doc) for doc in chat_history]
            export_data['chat_history'] = enrich_with_user_info(serialized_chats)
        
        if collection_name == 'all' or collection_name == 'user-context':
            user_context_collection = db['user_context']
            user_context = list(user_context_collection.find().sort("updatedAt", -1))
            serialized_context = [serialize_doc(doc) for doc in user_context]
            export_data['user_context'] = enrich_with_user_info(serialized_context)
        
        if export_format == 'excel':
            
            # Create Excel file
            output = io.BytesIO()
            
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                # Summary sheet
                summary_data = {
                    'Collection': [],
                    'Record Count': [],
                    'Export Date': []
                }
                
                for collection, records in export_data.items():
                    summary_data['Collection'].append(collection.replace('_', ' ').title())
                    summary_data['Record Count'].append(len(records))
                    summary_data['Export Date'].append(datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'))
                
                summary_df = pd.DataFrame(summary_data)
                summary_df.to_excel(writer, sheet_name='Summary', index=False)
                
                # Individual collection sheets
                for collection, records in export_data.items():
                    if records:
                        # Create a comprehensive DataFrame for each collection
                        df_data = []
                        for record in records[:1000]:  # Limit to 1000 records per sheet
                            row = {
                                'ID': str(record.get('_id', '')),
                                'User ID': record.get('userId', ''),
                                'Username': record.get('username', ''),
                                'Display Name': record.get('userName', ''),
                                'Email': record.get('userEmail', ''),
                                'Full Name': record.get('userFullName', ''),
                                'Action': record.get('action', ''),
                                'Type': record.get('type', ''),
                                'Created At': record.get('createdAt', ''),
                                'Updated At': record.get('updatedAt', ''),
                                'Data Size': len(str(record.get('data', {})))
                            }
                            df_data.append(row)
                        
                        df = pd.DataFrame(df_data)
                        sheet_name = collection.replace('_', ' ').title()[:31]  # Excel sheet name limit
                        df.to_excel(writer, sheet_name=sheet_name, index=False)
            
            output.seek(0)
            
            filename = f'smartbite-ai-{collection_name}-{datetime.utcnow().strftime("%Y%m%d")}.xlsx'
            
            return send_file(
                output,
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                as_attachment=True,
                download_name=filename
            )
        
        elif export_format == 'csv':
                
            # Create CSV content
            csv_data = []
            
            # Combine all collections into one CSV or create separate CSVs
            if collection_name == 'all':
                # Create a combined CSV with collection type column
                for collection, records in export_data.items():
                    for record in records:
                        row = {
                            'Collection': collection.replace('_', ' ').title(),
                            'ID': str(record.get('_id', '')),
                            'User ID': record.get('userId', ''),
                            'Username': record.get('username', ''),
                            'Display Name': record.get('userName', ''),
                            'Email': record.get('userEmail', ''),
                            'Full Name': record.get('userFullName', ''),
                            'Action': record.get('action', ''),
                            'Type': record.get('type', ''),
                            'Created At': record.get('createdAt', ''),
                            'Updated At': record.get('updatedAt', ''),
                            'Data Preview': str(record.get('data', {}))[:100] + '...' if record.get('data') else ''
                        }
                        csv_data.append(row)
            else:
                # Single collection CSV
                records = list(export_data.values())[0] if export_data else []
                for record in records:
                    row = {
                        'ID': str(record.get('_id', '')),
                        'User ID': record.get('userId', ''),
                        'Username': record.get('username', ''),
                        'Display Name': record.get('userName', ''),
                        'Email': record.get('userEmail', ''),
                        'Full Name': record.get('userFullName', ''),
                        'Action': record.get('action', ''),
                        'Type': record.get('type', ''),
                        'Created At': record.get('createdAt', ''),
                        'Updated At': record.get('updatedAt', ''),
                        'Data Preview': str(record.get('data', {}))[:100] + '...' if record.get('data') else ''
                    }
                    csv_data.append(row)
            
            # Convert to DataFrame and then to CSV
            df = pd.DataFrame(csv_data)
            
            # Create CSV content as bytes
            output = io.BytesIO()
            csv_content = df.to_csv(index=False, encoding='utf-8')
            output.write(csv_content.encode('utf-8'))
            output.seek(0)
            
            filename = f'smartbite-ai-{collection_name}-{datetime.utcnow().strftime("%Y%m%d")}.csv'
            
            return send_file(
                output,
                mimetype='text/csv',
                as_attachment=True,
                download_name=filename
            )
        
        else:
            # Return JSON format
            return jsonify({
                'success': True,
                'data': export_data,
                'exportInfo': {
                    'collection': collection_name,
                    'exportDate': datetime.utcnow().isoformat(),
                    'format': export_format,
                    'recordCounts': {k: len(v) for k, v in export_data.items()}
                }
            })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to export data: {str(e)}'
        }), 500