import api from './api.js'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export const analyticsService = {
  // Get comprehensive analytics data
  getAnalytics: async () => {
    try {
      return await api.get('/analytics')
    } catch (error) {
      console.error('Analytics API error:', error)
      throw new Error(`Failed to load analytics: ${error.response?.data?.message || error.message}`)
    }
  },

  // Export user data in multiple formats
  exportUserData: async (format = 'json') => {
    try {
      const response = await api.get('/analytics/export')
      const data = response.data?.data || response.data || {}
      
      const timestamp = new Date().toISOString().split('T')[0]
      const userId = data.userData?._id || data.exportInfo?.userId || 'unknown'
      
      if (format === 'excel') {
        // Create Excel workbook with multiple sheets using ExcelJS
        const workbook = new ExcelJS.Workbook()
        
        // User Information Sheet
        const userSheet = workbook.addWorksheet('User Information')
        userSheet.addRows([
          ['SmartBite Data Export'],
          ['Export Date', new Date().toLocaleDateString()],
          ['User ID', data.userData?._id || data.exportInfo?.userId || 'N/A'],
          ['Name', data.userData?.fullName || data.userData?.name || 'N/A'],
          ['Email', data.userData?.email || 'N/A'],
          ['Member Since', data.userData?.createdAt ? new Date(data.userData.createdAt).toLocaleDateString() : 'N/A'],
          ['Account Verified', data.userData?.isVerified ? 'Yes' : 'No'],
          [],
          ['Data Summary'],
          ['Total Meal Plans', data.mealPlans?.length || 0],
          ['Total Meals', data.mealPlans?.reduce((total, plan) => total + (plan.days?.reduce((dayTotal, day) => dayTotal + (day.meals?.length || 0), 0) || 0), 0) || 0],
          ['Total Feedback', data.feedbacks?.length || 0],
          ['Total Constraints', data.constraints?.length || 0],
          ['AI Interactions', data.flaskData?.summary?.totalRecords || 0]
        ])
        
        // Style the header
        userSheet.getCell('A1').font = { bold: true, size: 14 }
        userSheet.getCell('A9').font = { bold: true, size: 12 }
        
        // Meal Plans Sheet
        if (data.mealPlans && data.mealPlans.length > 0) {
          const mealPlansSheet = workbook.addWorksheet('Meal Plans')
          mealPlansSheet.addRow(['Meal Plan Title', 'Created Date', 'Total Meals', 'Status'])
          
          // Style header
          mealPlansSheet.getRow(1).font = { bold: true }
          
          data.mealPlans.forEach(plan => {
            const totalMeals = plan.days?.reduce((total, day) => total + (day.meals?.length || 0), 0) || 0
            mealPlansSheet.addRow([
              plan.title || 'Untitled',
              plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'N/A',
              totalMeals,
              plan.isActive ? 'Active' : 'Inactive'
            ])
          })
        }
        
        // Feedback Sheet
        if (data.feedbacks && data.feedbacks.length > 0) {
          const feedbackSheet = workbook.addWorksheet('Feedback')
          feedbackSheet.addRow(['Date', 'Rating', 'Type', 'Comment'])
          feedbackSheet.getRow(1).font = { bold: true }
          
          data.feedbacks.forEach(feedback => {
            feedbackSheet.addRow([
              feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : 'N/A',
              feedback.rating || 'N/A',
              feedback.type || 'N/A',
              feedback.comment || 'No comment'
            ])
          })
        }
        
        // AI Data Sheet
        if (data.flaskData && data.flaskData.data) {
          const aiSheet = workbook.addWorksheet('AI Data')
          aiSheet.addRows([
            ['AI Data Summary'],
            ['Total AI History Records', data.flaskData.data.aiHistory?.length || 0],
            ['Total Weekly Plans', data.flaskData.data.weeklyPlans?.length || 0],
            ['Total Health Reports', data.flaskData.data.healthRiskReports?.length || 0],
            ['Total Chat History', data.flaskData.data.chatHistory?.length || 0],
            [],
            ['Recent AI Interactions']
          ])
          
          aiSheet.getCell('A1').font = { bold: true, size: 12 }
          aiSheet.getCell('A7').font = { bold: true }
          
          if (data.flaskData.data.aiHistory && data.flaskData.data.aiHistory.length > 0) {
            aiSheet.addRow(['Date', 'Action', 'Type'])
            aiSheet.getRow(8).font = { bold: true }
            
            data.flaskData.data.aiHistory.slice(0, 20).forEach(interaction => {
              aiSheet.addRow([
                interaction.createdAt ? new Date(interaction.createdAt).toLocaleDateString() : 'N/A',
                interaction.action || 'N/A',
                interaction.type || 'N/A'
              ])
            })
          }
        }
        
        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        saveAs(blob, `smartbite-data-${userId}-${timestamp}.xlsx`)
        
      } else {
        // JSON format with better structure
        const formattedData = {
          exportInfo: {
            exportDate: new Date().toISOString(),
            userId: userId,
            format: 'SmartBite Complete Data Export',
            version: '2.0'
          },
          userProfile: {
            id: data.userData?._id,
            name: data.userData?.fullName || data.userData?.name,
            email: data.userData?.email,
            memberSince: data.userData?.createdAt,
            isVerified: data.userData?.isVerified,
            profile: data.userData?.profile,
            preferences: data.userData?.preferences
          },
          statistics: {
            totalMealPlans: data.mealPlans?.length || 0,
            totalMeals: data.mealPlans?.reduce((total, plan) => total + (plan.days?.reduce((dayTotal, day) => dayTotal + (day.meals?.length || 0), 0) || 0), 0) || 0,
            totalFeedback: data.feedbacks?.length || 0,
            totalConstraints: data.constraints?.length || 0,
            totalAiInteractions: data.flaskData?.summary?.totalRecords || 0
          },
          mealPlans: data.mealPlans || [],
          feedback: data.feedbacks || [],
          constraints: data.constraints || [],
          aiData: data.flaskData || null,
          readme: {
            description: 'This file contains all your SmartBite data in a structured format.',
            sections: {
              userProfile: 'Your account information and preferences',
              statistics: 'Summary of your data usage',
              mealPlans: 'All your created meal plans with detailed information',
              feedback: 'Your meal ratings and reviews',
              constraints: 'Your dietary constraints and preferences',
              aiData: 'All AI interactions, generated plans, and health reports'
            },
            support: 'For questions about this data export, contact SmartBite support.'
          }
        }
        
        const dataStr = JSON.stringify(formattedData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        saveAs(dataBlob, `smartbite-data-${userId}-${timestamp}.json`)
      }
      
      return { success: true, message: `Data exported successfully as ${format.toUpperCase()}` }
      
    } catch (error) {
      console.error('Export error:', error)
      throw new Error(`Failed to export data: ${error.response?.data?.message || error.message}`)
    }
  },

  // Get feedback statistics
  getFeedbackStats: async () => {
    return await api.get('/analytics/feedback')
  },

  // Get constraint statistics
  getConstraintStats: async () => {
    return await api.get('/analytics/constraints')
  }
}