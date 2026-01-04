"""
Analytics endpoints for Flask AI service
Provides comprehensive analytics and data export functionality
"""

from flask import Blueprint, request, jsonify, send_file
from datetime import datetime, timedelta
import json
import io
import hmac
import hashlib
import time
import os
from functools import wraps
from ..db.mongo import db

# ✅ GRACEFUL PANDAS IMPORT (prevents OOM on Render)
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    print("Warning: pandas not available. Excel export functionality disabled.")

analytics_bp = Blueprint('analytics', __name__)

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

@analytics_bp.route('/internal/analytics', methods=['POST'])
@require_internal_auth
def get_analytics():
    """Get comprehensive analytics for a user"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400
        
        # Get database connection
        db = get_db_connection()
        
        # Initialize analytics data
        analytics = {
            'userId': user_id,
            'generatedAt': datetime.utcnow().isoformat(),
            'totalInteractions': 0,
            'interactionsByType': {},
            'weeklyPlans': 0,
            'healthRiskReports': 0,
            'chatMessages': 0,
            'mealAnalyses': 0,
            'nutritionSummaries': 0,
            'recentActivity': [],
            'dataBreakdown': {},
            'storageStats': {}
        }
        
        # Get AI history data
        history_collection = db['ai_history']
        history_data = list(history_collection.find({'userId': user_id}))
        
        analytics['totalInteractions'] = len(history_data)
        
        # Analyze interactions by type
        interaction_types = {}
        recent_activity = []
        
        for interaction in history_data:
            action = interaction.get('action', 'unknown')
            interaction_types[action] = interaction_types.get(action, 0) + 1
            
            # Add to recent activity (last 10)
            if len(recent_activity) < 10:
                recent_activity.append({
                    'action': action,
                    'timestamp': interaction.get('createdAt', ''),
                    'data': interaction.get('data', {})
                })
        
        analytics['interactionsByType'] = interaction_types
        analytics['recentActivity'] = recent_activity
        
        # Count specific interaction types
        analytics['chatMessages'] = interaction_types.get('chat', 0)
        analytics['mealAnalyses'] = interaction_types.get('analyze_meals', 0)
        analytics['weeklyPlans'] = interaction_types.get('generate_weekly_plan', 0)
        analytics['healthRiskReports'] = interaction_types.get('health_risk_report', 0)
        analytics['nutritionSummaries'] = interaction_types.get('nutrition_impact_summary', 0)
        
        # Get weekly plans data
        weekly_plans_collection = db['weekly_plans']
        weekly_plans = list(weekly_plans_collection.find({'userId': user_id}))
        analytics['weeklyPlans'] = len(weekly_plans)
        
        # Get health risk reports data
        health_reports_collection = db['health_risk_reports']
        health_reports = list(health_reports_collection.find({'userId': user_id}))
        analytics['healthRiskReports'] = len(health_reports)
        
        # Calculate data breakdown
        analytics['dataBreakdown'] = {
            'aiHistory': len(history_data),
            'weeklyPlans': len(weekly_plans),
            'healthReports': len(health_reports),
            'totalDocuments': len(history_data) + len(weekly_plans) + len(health_reports)
        }
        
        # Calculate storage statistics (rough estimation)
        total_size = 0
        for item in history_data + weekly_plans + health_reports:
            total_size += len(json.dumps(item, default=str))
        
        analytics['storageStats'] = {
            'totalSizeBytes': total_size,
            'totalSizeKB': round(total_size / 1024, 2),
            'averageDocumentSize': round(total_size / max(1, analytics['dataBreakdown']['totalDocuments']), 2)
        }
        
        # Activity timeline (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_interactions = [
            interaction for interaction in history_data
            if interaction.get('createdAt') and 
            datetime.fromisoformat(interaction['createdAt'].replace('Z', '+00:00')) > thirty_days_ago
        ]
        
        analytics['last30Days'] = {
            'totalInteractions': len(recent_interactions),
            'averagePerDay': round(len(recent_interactions) / 30, 2),
            'mostActiveDay': None  # Could be calculated if needed
        }
        
        return jsonify({
            'success': True,
            'data': analytics
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get analytics: {str(e)}'
        }), 500

@analytics_bp.route('/internal/export-data', methods=['POST'])
@require_internal_auth
def export_user_data():
    """Export all user data from Flask AI service"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        export_format = data.get('format', 'json')  # json or excel
        
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400
        
        # Get database connection
        db = get_db_connection()
        
        # Export data structure
        export_data = {
            'exportInfo': {
                'userId': user_id,
                'exportDate': datetime.utcnow().isoformat(),
                'source': 'flask-ai-service',
                'version': '2.0',
                'format': export_format
            },
            'data': {}
        }
        
        # Export AI history
        history_collection = db['ai_history']
        ai_history = list(history_collection.find({'userId': user_id}))
        export_data['data']['aiHistory'] = ai_history
        
        # Export weekly plans
        weekly_plans_collection = db['weekly_plans']
        weekly_plans = list(weekly_plans_collection.find({'userId': user_id}))
        export_data['data']['weeklyPlans'] = weekly_plans
        
        # Export health risk reports
        health_reports_collection = db['health_risk_reports']
        health_reports = list(health_reports_collection.find({'userId': user_id}))
        export_data['data']['healthRiskReports'] = health_reports
        
        # Export chat history (if exists)
        chat_collection = db.get('chat_history')
        if chat_collection:
            chat_history = list(chat_collection.find({'userId': user_id}))
            export_data['data']['chatHistory'] = chat_history
        
        # Export nutrition summaries (if exists)
        nutrition_collection = db.get('nutrition_summaries')
        if nutrition_collection:
            nutrition_summaries = list(nutrition_collection.find({'userId': user_id}))
            export_data['data']['nutritionSummaries'] = nutrition_summaries
        
        # Add summary statistics
        export_data['summary'] = {
            'totalRecords': sum(len(collection) for collection in export_data['data'].values()),
            'collections': list(export_data['data'].keys()),
            'recordCounts': {key: len(value) for key, value in export_data['data'].items()},
            'readme': {
                'description': 'SmartBite AI Data Export - Complete AI interaction history',
                'collections': {
                    'aiHistory': 'All AI interactions including chats, analyses, and generations',
                    'weeklyPlans': 'AI-generated weekly meal plans',
                    'healthRiskReports': 'Health risk assessment reports',
                    'chatHistory': 'Detailed chat conversation history',
                    'nutritionSummaries': 'Nutrition impact analysis summaries'
                },
                'dataTypes': {
                    'chat': 'AI nutritionist conversations',
                    'analyze-meals': 'Nutritional meal analyses',
                    'generate-weekly-plan': 'Weekly meal plan generations',
                    'health-risk-report': 'Health risk assessments',
                    'nutrition-impact-summary': 'Nutrition impact analyses'
                },
                'usage': 'This data can be used for personal analysis, backup, or migration purposes'
            }
        }
        
        if export_format == 'excel':
            if not PANDAS_AVAILABLE:
                return jsonify({
                    'success': False,
                    'error': 'Excel export not available. pandas library not installed. Use JSON format instead.'
                }), 400
            
            # Create Excel file
            output = io.BytesIO()
            
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                # Summary sheet
                summary_data = {
                    'Metric': [
                        'Export Date',
                        'User ID', 
                        'Total AI Interactions',
                        'Weekly Plans Generated',
                        'Health Risk Reports',
                        'Chat Messages',
                        'Nutrition Summaries'
                    ],
                    'Value': [
                        datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
                        user_id,
                        len(ai_history),
                        len(weekly_plans),
                        len(health_reports),
                        len(export_data['data'].get('chatHistory', [])),
                        len(export_data['data'].get('nutritionSummaries', []))
                    ]
                }
                
                summary_df = pd.DataFrame(summary_data)
                summary_df.to_excel(writer, sheet_name='Summary', index=False)
                
                # AI History sheet
                if ai_history:
                    history_df_data = []
                    for item in ai_history:
                        history_df_data.append({
                            'Date': item.get('createdAt', ''),
                            'Action': item.get('action', ''),
                            'Type': item.get('type', ''),
                            'Status': 'Completed',
                            'Data_Size': len(str(item.get('data', {})))
                        })
                    
                    history_df = pd.DataFrame(history_df_data)
                    history_df.to_excel(writer, sheet_name='AI History', index=False)
                
                # Weekly Plans sheet
                if weekly_plans:
                    plans_df_data = []
                    for plan in weekly_plans:
                        plans_df_data.append({
                            'Date Created': plan.get('createdAt', ''),
                            'Plan Type': 'Weekly Meal Plan',
                            'Status': 'Generated',
                            'Data_Size': len(str(plan.get('data', {})))
                        })
                    
                    plans_df = pd.DataFrame(plans_df_data)
                    plans_df.to_excel(writer, sheet_name='Weekly Plans', index=False)
                
                # Health Reports sheet
                if health_reports:
                    reports_df_data = []
                    for report in health_reports:
                        reports_df_data.append({
                            'Date': report.get('createdAt', ''),
                            'Report Type': 'Health Risk Assessment',
                            'Risk Level': report.get('data', {}).get('overallRisk', 'N/A'),
                            'Status': 'Completed'
                        })
                    
                    reports_df = pd.DataFrame(reports_df_data)
                    reports_df.to_excel(writer, sheet_name='Health Reports', index=False)
            
            output.seek(0)
            
            return send_file(
                output,
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                as_attachment=True,
                download_name=f'smartbite-ai-data-{user_id}-{datetime.utcnow().strftime("%Y%m%d")}.xlsx'
            )
        
        else:
            # Return JSON format
            return jsonify({
                'success': True,
                'data': export_data
            })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to export data: {str(e)}'
        }), 500

@analytics_bp.route('/internal/ai-dashboard-stats', methods=['POST'])
@require_internal_auth
def get_ai_dashboard_stats():
    """Get AI-specific dashboard statistics"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400
        
        # Get database connection
        db = get_db_connection()
        
        # Initialize stats
        stats = {
            'userId': user_id,
            'generatedAt': datetime.utcnow().isoformat(),
            'aiInteractions': {
                'total': 0,
                'byType': {},
                'last7Days': 0,
                'last30Days': 0
            },
            'weeklyPlans': {
                'total': 0,
                'active': 0,
                'completed': 0
            },
            'healthReports': {
                'total': 0,
                'riskLevels': {},
                'latest': None
            },
            'chatActivity': {
                'totalMessages': 0,
                'averageLength': 0,
                'topics': []
            },
            'performance': {
                'averageResponseTime': 0,
                'successRate': 100,
                'errorCount': 0
            }
        }
        
        # Get AI history
        history_collection = db['ai_history']
        history_data = list(history_collection.find({'userId': user_id}))
        
        stats['aiInteractions']['total'] = len(history_data)
        
        # Calculate time-based statistics
        now = datetime.utcnow()
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)
        
        last_7_days = 0
        last_30_days = 0
        interaction_types = {}
        
        for interaction in history_data:
            action = interaction.get('action', 'unknown')
            interaction_types[action] = interaction_types.get(action, 0) + 1
            
            created_at = interaction.get('createdAt')
            if created_at:
                try:
                    interaction_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    if interaction_date > seven_days_ago:
                        last_7_days += 1
                    if interaction_date > thirty_days_ago:
                        last_30_days += 1
                except:
                    pass
        
        stats['aiInteractions']['byType'] = interaction_types
        stats['aiInteractions']['last7Days'] = last_7_days
        stats['aiInteractions']['last30Days'] = last_30_days
        
        # Get weekly plans statistics
        weekly_plans_collection = db['weekly_plans']
        weekly_plans = list(weekly_plans_collection.find({'userId': user_id}))
        stats['weeklyPlans']['total'] = len(weekly_plans)
        
        # Get health reports statistics
        health_reports_collection = db['health_risk_reports']
        health_reports = list(health_reports_collection.find({'userId': user_id}))
        stats['healthReports']['total'] = len(health_reports)
        
        if health_reports:
            # Get latest health report
            latest_report = max(health_reports, key=lambda x: x.get('createdAt', ''))
            stats['healthReports']['latest'] = {
                'date': latest_report.get('createdAt'),
                'riskLevel': latest_report.get('data', {}).get('overallRisk', 'unknown')
            }
        
        # Chat activity statistics
        chat_messages = [h for h in history_data if h.get('action') == 'chat']
        stats['chatActivity']['totalMessages'] = len(chat_messages)
        
        if chat_messages:
            total_length = sum(len(str(msg.get('data', {}).get('message', ''))) for msg in chat_messages)
            stats['chatActivity']['averageLength'] = round(total_length / len(chat_messages), 2)
        
        return jsonify({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get AI dashboard stats: {str(e)}'
        }), 500