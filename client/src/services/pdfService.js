import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const pdfService = {
  /**
   * Generate and download a PDF for a meal plan
   */
  generateMealPlanPDF: (plan) => {
    try {
      // Create new PDF document
      const doc = new jsPDF()
      
      // Set up colors and fonts
      const primaryColor = [59, 130, 246] // Blue
      const secondaryColor = [107, 114, 128] // Gray
      const successColor = [34, 197, 94] // Green
      
      // Helper function to format dates
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
      const getWeekEndDate = (startDate) => {
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 6)
        return endDate
      }
      
      // Calculate adherence stats
      const getAdherenceStats = () => {
        let eaten = 0, skipped = 0, replaced = 0, planned = 0
        
        plan.days.forEach(day => {
          day.meals.forEach(meal => {
            switch (meal.adherence.status) {
              case 'eaten': eaten++; break
              case 'skipped': skipped++; break
              case 'replaced': replaced++; break
              default: planned++; break
            }
          })
        })
        
        const total = eaten + skipped + replaced + planned
        return { eaten, skipped, replaced, planned, total }
      }
      
      const adherenceStats = getAdherenceStats()
      const completionRate = adherenceStats.total > 0 
        ? Math.round(((adherenceStats.eaten + adherenceStats.replaced) / adherenceStats.total) * 100)
        : 0
      
      let yPosition = 20
      
      // Header Section
      doc.setFontSize(24)
      doc.setTextColor(...primaryColor)
      doc.text('SmartBite Meal Plan', 20, yPosition)
      
      yPosition += 15
      doc.setFontSize(18)
      doc.setTextColor(0, 0, 0)
      doc.text(plan.title, 20, yPosition)
      
      yPosition += 10
      doc.setFontSize(12)
      doc.setTextColor(...secondaryColor)
      doc.text(`${formatDate(plan.weekStartDate)} - ${formatDate(getWeekEndDate(plan.weekStartDate))}`, 20, yPosition)
      
      yPosition += 5
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition)
      
      yPosition += 20
      
      // Summary Statistics Section
      doc.setFontSize(16)
      doc.setTextColor(...primaryColor)
      doc.text('Plan Summary', 20, yPosition)
      
      yPosition += 15
      
      // Create summary table
      const summaryData = [
        ['Total Meals', adherenceStats.total.toString()],
        ['Completion Rate', `${completionRate}%`],
        ['Meals Eaten', adherenceStats.eaten.toString()],
        ['Meals Replaced', adherenceStats.replaced.toString()],
        ['Meals Skipped', adherenceStats.skipped.toString()],
        ['Meals Planned', adherenceStats.planned.toString()]
      ]
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: 'center' }
        }
      })
      
      yPosition = doc.lastAutoTable.finalY + 20
      
      // Nutrition Summary Section (if available)
      if (plan.nutritionSummary) {
        doc.setFontSize(16)
        doc.setTextColor(...primaryColor)
        doc.text('Weekly Nutrition Summary', 20, yPosition)
        
        yPosition += 15
        
        const nutritionData = [
          ['Calories', `${plan.nutritionSummary.calories}`, `${Math.round(plan.nutritionSummary.calories / 7)}/day`],
          ['Protein', `${plan.nutritionSummary.protein}g`, `${Math.round(plan.nutritionSummary.protein / 7)}g/day`],
          ['Carbohydrates', `${plan.nutritionSummary.carbs}g`, `${Math.round(plan.nutritionSummary.carbs / 7)}g/day`],
          ['Fats', `${plan.nutritionSummary.fats}g`, `${Math.round(plan.nutritionSummary.fats / 7)}g/day`]
        ]
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Nutrient', 'Weekly Total', 'Daily Average']],
          body: nutritionData,
          theme: 'grid',
          headStyles: { fillColor: successColor, textColor: 255 },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 40, halign: 'center' },
            2: { cellWidth: 40, halign: 'center' }
          }
        })
        
        yPosition = doc.lastAutoTable.finalY + 20
      }
      
      // Weekly Schedule Section
      doc.setFontSize(16)
      doc.setTextColor(...primaryColor)
      doc.text('Weekly Meal Schedule', 20, yPosition)
      
      yPosition += 15
      
      // Sort days in proper order
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      const sortedDays = plan.days.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))
      
      // Create meal schedule table
      const scheduleData = []
      
      sortedDays.forEach(day => {
        const dayName = day.day.charAt(0).toUpperCase() + day.day.slice(1)
        
        // Group meals by type
        const mealsByType = {}
        day.meals.forEach(meal => {
          if (!mealsByType[meal.mealType]) {
            mealsByType[meal.mealType] = []
          }
          mealsByType[meal.mealType].push(meal)
        })
        
        // Add meals for each type
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']
        let isFirstRow = true
        
        mealTypes.forEach(mealType => {
          if (mealsByType[mealType]) {
            mealsByType[mealType].forEach(meal => {
              const statusIcon = {
                'eaten': '✓',
                'skipped': '✗',
                'replaced': '↻',
                'planned': '○'
              }[meal.adherence.status] || '○'
              
              const mealName = meal.meal?.name || 'Unknown Meal'
              const replacedText = meal.adherence.status === 'replaced' && meal.adherence.replacedWith 
                ? ` (→ ${meal.adherence.replacedWith})` 
                : ''
              
              scheduleData.push([
                isFirstRow ? dayName : '',
                mealType.charAt(0).toUpperCase() + mealType.slice(1),
                mealName + replacedText,
                statusIcon
              ])
              
              isFirstRow = false
            })
          }
        })
        
        // Add empty row between days for better readability
        if (day !== sortedDays[sortedDays.length - 1]) {
          scheduleData.push(['', '', '', ''])
        }
      })
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Day', 'Meal Type', 'Meal', 'Status']],
        body: scheduleData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 25, fontStyle: 'bold' },
          1: { cellWidth: 25 },
          2: { cellWidth: 80 },
          3: { cellWidth: 15, halign: 'center' }
        },
        didParseCell: function(data) {
          // Style day names
          if (data.column.index === 0 && data.cell.text[0] && data.cell.text[0] !== '') {
            data.cell.styles.fillColor = [249, 250, 251]
            data.cell.styles.textColor = [31, 41, 55]
            data.cell.styles.fontStyle = 'bold'
          }
          
          // Style status icons with colors
          if (data.column.index === 3) {
            const status = data.cell.text[0]
            if (status === '✓') {
              data.cell.styles.textColor = [34, 197, 94] // Green
            } else if (status === '✗') {
              data.cell.styles.textColor = [239, 68, 68] // Red
            } else if (status === '↻') {
              data.cell.styles.textColor = [59, 130, 246] // Blue
            }
          }
        }
      })
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(...secondaryColor)
        doc.text(`Generated by SmartBite - Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10)
        doc.text(new Date().toLocaleString(), doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10)
      }
      
      // Generate filename
      const startDate = new Date(plan.weekStartDate).toISOString().split('T')[0]
      const filename = `SmartBite_MealPlan_${plan.title.replace(/[^a-zA-Z0-9]/g, '_')}_${startDate}.pdf`
      
      // Save the PDF
      doc.save(filename)
      
      return { success: true, filename }
      
    } catch (error) {
      console.error('PDF generation error:', error)
      throw new Error(`Failed to generate PDF: ${error.message}`)
    }
  },

  /**
   * Generate and download a PDF for AI Weekly Summary
   */
  generateWeeklySummaryPDF: (selectedPlan, summary) => {
    try {
      const doc = new jsPDF()
      
      // Set up colors
      const primaryColor = [34, 197, 94] // Green
      const secondaryColor = [107, 114, 128] // Gray
      
      let yPosition = 20
      
      // Header Section
      doc.setFontSize(24)
      doc.setTextColor(...primaryColor)
      doc.text('SmartBite AI Weekly Summary', 20, yPosition)
      
      yPosition += 15
      doc.setFontSize(12)
      doc.setTextColor(...secondaryColor)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition)
      
      if (selectedPlan?.createdAt) {
        yPosition += 8
        doc.text(`Plan Date: ${new Date(selectedPlan.createdAt).toLocaleDateString()}`, 20, yPosition)
      }
      
      yPosition += 20
      
      // Weekly Plan Section
      if (selectedPlan?.data) {
        doc.setFontSize(16)
        doc.setTextColor(...primaryColor)
        doc.text('Weekly Meal Plan Overview', 20, yPosition)
        
        yPosition += 15
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        const planData = selectedPlan.data.weeklyPlan || selectedPlan.data
        
        const weeklyPlanData = days.map(day => [
          day,
          planData[day] ? planData[day].replace(/\*\*/g, '').substring(0, 100) + '...' : 'No plan'
        ])
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Day', 'Meal Plan']],
          body: weeklyPlanData,
          theme: 'grid',
          headStyles: { fillColor: primaryColor, textColor: 255 },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold' },
            1: { cellWidth: 140 }
          }
        })
        
        yPosition = doc.lastAutoTable.finalY + 20
      }
      
      // AI Summary Section
      if (summary?.summary) {
        // Check if we need a new page
        if (yPosition > 200) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(16)
        doc.setTextColor(...primaryColor)
        doc.text('AI Analysis Summary', 20, yPosition)
        
        yPosition += 15
        
        // Split summary into paragraphs and add to PDF
        const summaryText = summary.summary.replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
        const paragraphs = summaryText.split('\n').filter(p => p.trim())
        
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        
        paragraphs.forEach(paragraph => {
          if (paragraph.trim()) {
            const lines = doc.splitTextToSize(paragraph, 170)
            lines.forEach(line => {
              if (yPosition > 270) {
                doc.addPage()
                yPosition = 20
              }
              doc.text(line, 20, yPosition)
              yPosition += 6
            })
            yPosition += 4 // Extra space between paragraphs
          }
        })
      }
      
      // Key Improvements Section
      if (summary?.keyImprovements && Array.isArray(summary.keyImprovements)) {
        if (yPosition > 220) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(14)
        doc.setTextColor(...primaryColor)
        doc.text('Key Improvements Identified', 20, yPosition)
        
        yPosition += 12
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        
        summary.keyImprovements.forEach(improvement => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
          doc.text('• ' + improvement, 25, yPosition)
          yPosition += 8
        })
      }
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(...secondaryColor)
        doc.text(`Generated by SmartBite AI - Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10)
        doc.text(new Date().toLocaleString(), doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10)
      }
      
      // Generate filename
      const date = new Date().toISOString().split('T')[0]
      const filename = `SmartBite_AI_Weekly_Summary_${date}.pdf`
      
      // Save the PDF
      doc.save(filename)
      
      return { success: true, filename }
      
    } catch (error) {
      console.error('PDF generation error:', error)
      throw new Error(`Failed to generate PDF: ${error.message}`)
    }
  },

  /**
   * Generate and download a PDF for AI Nutrition Impact Summary
   */
  generateNutritionImpactPDF: (selectedPlan, selectedHealthRisk, impactSummary) => {
    try {
      const doc = new jsPDF()
      
      // Set up colors
      const primaryColor = [239, 68, 68] // Red
      const secondaryColor = [107, 114, 128] // Gray
      const blueColor = [59, 130, 246] // Blue
      
      let yPosition = 20
      
      // Header Section
      doc.setFontSize(24)
      doc.setTextColor(...primaryColor)
      doc.text('SmartBite AI Nutrition Impact', 20, yPosition)
      
      yPosition += 15
      doc.setFontSize(12)
      doc.setTextColor(...secondaryColor)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition)
      
      yPosition += 20
      
      // Plan and Risk Report Summary
      doc.setFontSize(16)
      doc.setTextColor(...primaryColor)
      doc.text('Analysis Overview', 20, yPosition)
      
      yPosition += 15
      
      const overviewData = [
        ['Weekly Plan Date', selectedPlan?.createdAt ? new Date(selectedPlan.createdAt).toLocaleDateString() : 'Unknown'],
        ['Health Risk Report Date', selectedHealthRisk?.createdAt ? new Date(selectedHealthRisk.createdAt).toLocaleDateString() : 'Unknown'],
        ['Total Calories (Risk Report)', selectedHealthRisk?.data?.summary?.totalCalories?.toString() || '0'],
        ['Total Protein (Risk Report)', (selectedHealthRisk?.data?.summary?.totalProtein || 0) + 'g'],
        ['Detected Risks', Array.isArray(selectedHealthRisk?.data?.detectedRisks) ? selectedHealthRisk.data.detectedRisks.length.toString() : '0']
      ]
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: overviewData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 60, halign: 'center' }
        }
      })
      
      yPosition = doc.lastAutoTable.finalY + 20
      
      // Health Risk Summary
      if (selectedHealthRisk?.data?.summary) {
        doc.setFontSize(14)
        doc.setTextColor(...blueColor)
        doc.text('Nutritional Profile from Health Risk Report', 20, yPosition)
        
        yPosition += 12
        
        const nutritionData = [
          ['Calories', selectedHealthRisk.data.summary.totalCalories?.toString() || '0'],
          ['Protein', (selectedHealthRisk.data.summary.totalProtein || 0) + 'g'],
          ['Fiber', (selectedHealthRisk.data.summary.totalFiber || 0) + 'g'],
          ['Sodium', (selectedHealthRisk.data.summary.totalSodium || 0) + 'mg'],
          ['Sugar', (selectedHealthRisk.data.summary.totalSugar || 0) + 'g']
        ]
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Nutrient', 'Amount']],
          body: nutritionData,
          theme: 'grid',
          headStyles: { fillColor: blueColor, textColor: 255 },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 40, halign: 'center' }
          }
        })
        
        yPosition = doc.lastAutoTable.finalY + 20
      }
      
      // AI Impact Summary
      if (impactSummary?.summary) {
        // Check if we need a new page
        if (yPosition > 200) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(16)
        doc.setTextColor(...primaryColor)
        doc.text('AI Nutrition Impact Analysis', 20, yPosition)
        
        yPosition += 15
        
        // Split summary into paragraphs and add to PDF
        const summaryText = impactSummary.summary.replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
        const paragraphs = summaryText.split('\n').filter(p => p.trim())
        
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        
        paragraphs.forEach(paragraph => {
          if (paragraph.trim()) {
            const lines = doc.splitTextToSize(paragraph, 170)
            lines.forEach(line => {
              if (yPosition > 270) {
                doc.addPage()
                yPosition = 20
              }
              doc.text(line, 20, yPosition)
              yPosition += 6
            })
            yPosition += 4 // Extra space between paragraphs
          }
        })
      }
      
      // Expected Timeline
      if (impactSummary?.timeframe) {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(14)
        doc.setTextColor(...blueColor)
        doc.text('Expected Timeline', 20, yPosition)
        
        yPosition += 12
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        
        const timelineLines = doc.splitTextToSize(impactSummary.timeframe, 170)
        timelineLines.forEach(line => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
          doc.text(line, 20, yPosition)
          yPosition += 6
        })
      }
      
      // Medical Disclaimer
      if (yPosition > 220) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.setFontSize(12)
      doc.setTextColor(...primaryColor)
      doc.text('Important Health Disclaimer', 20, yPosition)
      
      yPosition += 12
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      
      const disclaimerText = 'This nutrition impact analysis is AI-generated for informational purposes only. It is not intended as medical advice, diagnosis, or treatment. Individual responses to dietary changes vary significantly. Always consult with qualified healthcare professionals before making significant dietary changes.'
      const disclaimerLines = doc.splitTextToSize(disclaimerText, 170)
      
      disclaimerLines.forEach(line => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(line, 20, yPosition)
        yPosition += 5
      })
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(...secondaryColor)
        doc.text(`Generated by SmartBite AI - Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10)
        doc.text(new Date().toLocaleString(), doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10)
      }
      
      // Generate filename
      const date = new Date().toISOString().split('T')[0]
      const filename = `SmartBite_AI_Nutrition_Impact_${date}.pdf`
      
      // Save the PDF
      doc.save(filename)
      
      return { success: true, filename }
      
    } catch (error) {
      console.error('PDF generation error:', error)
      throw new Error(`Failed to generate PDF: ${error.message}`)
    }
  },

  /**
   * Generate and download a PDF for My Meals
   */
  generateMyMealsPDF: async (meals, user) => {
    try {
      const doc = new jsPDF()
      
      // Set up colors
      const primaryColor = [59, 130, 246] // Blue
      const secondaryColor = [107, 114, 128] // Gray
      const greenColor = [34, 197, 94] // Green
      
      let yPosition = 20
      
      // Header Section
      doc.setFontSize(24)
      doc.setTextColor(...primaryColor)
      doc.text('SmartBite My Meals Collection', 20, yPosition)
      
      yPosition += 15
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text(`${user?.name || 'User'}'s Recipe Collection`, 20, yPosition)
      
      yPosition += 10
      doc.setFontSize(12)
      doc.setTextColor(...secondaryColor)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition)
      doc.text(`Total Meals: ${meals.length}`, 20, yPosition + 8)
      
      yPosition += 25
      
      // Summary Statistics
      const totalLikes = meals.reduce((sum, meal) => sum + (meal.likedBy?.length || 0), 0)
      const avgCookTime = meals.length > 0 
        ? Math.round(meals.reduce((sum, meal) => sum + (meal.cookTime || 0), 0) / meals.length)
        : 0
      const cuisineTypes = [...new Set(meals.map(meal => meal.cuisine).filter(Boolean))]
      
      doc.setFontSize(16)
      doc.setTextColor(...primaryColor)
      doc.text('Collection Summary', 20, yPosition)
      
      yPosition += 15
      
      const summaryData = [
        ['Total Recipes', meals.length.toString()],
        ['Total Likes Received', totalLikes.toString()],
        ['Average Cook Time', avgCookTime + ' minutes'],
        ['Cuisine Varieties', cuisineTypes.length.toString()],
        ['Most Popular Cuisine', cuisineTypes[0] || 'N/A']
      ]
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 60, halign: 'center' }
        }
      })
      
      yPosition = doc.lastAutoTable.finalY + 20
      
      // Meals List
      if (meals.length > 0) {
        doc.setFontSize(16)
        doc.setTextColor(...primaryColor)
        doc.text('Recipe Details', 20, yPosition)
        
        yPosition += 15
        
        const mealsData = meals.map(meal => [
          meal.name || 'Untitled Recipe',
          meal.cuisine || 'N/A',
          (meal.cookTime || 0) + ' min',
          (meal.likedBy?.length || 0).toString(),
          meal.difficulty || 'N/A',
          meal.createdAt ? new Date(meal.createdAt).toLocaleDateString() : 'N/A'
        ])
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Recipe Name', 'Cuisine', 'Cook Time', 'Likes', 'Difficulty', 'Created']],
          body: mealsData,
          theme: 'grid',
          headStyles: { fillColor: greenColor, textColor: 255 },
          styles: { 
            fontSize: 8,
            cellPadding: 2
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 25 },
            2: { cellWidth: 20 },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 20 },
            5: { cellWidth: 25 }
          }
        })
        
        yPosition = doc.lastAutoTable.finalY + 20
        
        // Detailed Recipe Information with Photos (first 5 recipes)
        const recipesToDetail = meals.slice(0, 5)
        
        if (recipesToDetail.length > 0) {
          // Check if we need a new page
          if (yPosition > 200) {
            doc.addPage()
            yPosition = 20
          }
          
          doc.setFontSize(16)
          doc.setTextColor(...primaryColor)
          doc.text('Featured Recipe Details', 20, yPosition)
          
          yPosition += 15
          
          // Helper function to convert image URL to base64
          const getImageAsBase64 = (imageUrl) => {
            return new Promise((resolve, reject) => {
              const img = new Image()
              img.crossOrigin = 'anonymous'
              
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              
              img.onload = () => {
                try {
                  // Calculate dimensions
                  const maxWidth = 60
                  const maxHeight = 45
                  let { width, height } = img
                  
                  const aspectRatio = width / height
                  if (width > maxWidth) {
                    width = maxWidth
                    height = width / aspectRatio
                  }
                  if (height > maxHeight) {
                    height = maxHeight
                    width = height * aspectRatio
                  }
                  
                  canvas.width = width
                  canvas.height = height
                  
                  // Draw image
                  ctx.drawImage(img, 0, 0, width, height)
                  
                  // Convert to base64
                  const dataURL = canvas.toDataURL('image/jpeg', 0.8)
                  
                  // Clean up
                  canvas.remove()
                  
                  resolve({ dataURL, width, height })
                } catch (error) {
                  canvas.remove()
                  reject(error)
                }
              }
              
              img.onerror = (error) => {
                canvas.remove()
                console.warn('Image load error:', error)
                reject(new Error('Failed to load image'))
              }
              
              // Set timeout
              setTimeout(() => {
                canvas.remove()
                reject(new Error('Image load timeout'))
              }, 10000) // Increased timeout to 10 seconds
              
              // Try to load the image with different approaches for Cloudinary
              try {
                // For Cloudinary URLs, try to add transformation parameters for better loading
                let processedUrl = imageUrl
                if (imageUrl.includes('cloudinary.com')) {
                  // Add transformation to optimize for PDF (smaller size, better compression)
                  if (!imageUrl.includes('/w_')) {
                    processedUrl = imageUrl.replace('/upload/', '/upload/w_200,h_150,c_fill,f_jpg,q_80/')
                  }
                }
                
                console.log('Loading image:', processedUrl)
                img.src = processedUrl
              } catch (error) {
                canvas.remove()
                reject(error)
              }
            })
          }
          
          // Pre-load all images first
          const imagePromises = recipesToDetail.map(async (meal, index) => {
            if (!meal.image) return { index, imageData: null }
            
            try {
              const imageData = await getImageAsBase64(meal.image)
              return { index, imageData }
            } catch (error) {
              console.warn(`Failed to load image for meal ${index}:`, error)
              return { index, imageData: null }
            }
          })
          
          // Wait for all images to load (or fail)
          const imageResults = await Promise.all(imagePromises)
          const imageMap = new Map()
          imageResults.forEach(result => {
            imageMap.set(result.index, result.imageData)
          })
          
          // Now generate the PDF with the loaded images
          for (let index = 0; index < recipesToDetail.length; index++) {
            const meal = recipesToDetail[index]
            
            // Check if we need a new page for each recipe
            if (yPosition > 180) {
              doc.addPage()
              yPosition = 20
            }
            
            // Recipe title
            doc.setFontSize(12)
            doc.setTextColor(...greenColor)
            doc.text(`${index + 1}. ${meal.name || 'Untitled Recipe'}`, 20, yPosition)
            
            yPosition += 15
            
            // Add recipe image if available
            let imageHeight = 0
            const imageData = imageMap.get(index)
            
            if (meal.image) {
              if (imageData) {
                try {
                  // Add the loaded image to PDF
                  const imgX = doc.internal.pageSize.width - imageData.width - 20
                  const imgY = yPosition - 10
                  
                  doc.addImage(imageData.dataURL, 'JPEG', imgX, imgY, imageData.width, imageData.height)
                  imageHeight = imageData.height + 10
                } catch (error) {
                  console.warn('Error adding image to PDF:', error)
                  // Fallback to placeholder
                  const imgWidth = 60
                  const imgHeight = 45
                  const imgX = doc.internal.pageSize.width - imgWidth - 20
                  const imgY = yPosition - 10
                  
                  doc.setDrawColor(200, 200, 200)
                  doc.setFillColor(245, 245, 245)
                  doc.rect(imgX, imgY, imgWidth, imgHeight, 'FD')
                  
                  doc.setFontSize(8)
                  doc.setTextColor(150, 150, 150)
                  doc.text('Image failed', imgX + imgWidth/2, imgY + imgHeight/2 - 2, { align: 'center' })
                  doc.text('to load', imgX + imgWidth/2, imgY + imgHeight/2 + 3, { align: 'center' })
                  
                  imageHeight = imgHeight + 10
                }
              } else {
                // Fallback to placeholder when image failed to load
                const imgWidth = 60
                const imgHeight = 45
                const imgX = doc.internal.pageSize.width - imgWidth - 20
                const imgY = yPosition - 10
                
                doc.setDrawColor(200, 200, 200)
                doc.setFillColor(245, 245, 245)
                doc.rect(imgX, imgY, imgWidth, imgHeight, 'FD')
                
                doc.setFontSize(8)
                doc.setTextColor(150, 150, 150)
                doc.text('Image not', imgX + imgWidth/2, imgY + imgHeight/2 - 2, { align: 'center' })
                doc.text('available', imgX + imgWidth/2, imgY + imgHeight/2 + 3, { align: 'center' })
                
                imageHeight = imgHeight + 10
              }
            }
            
            doc.setFontSize(9)
            doc.setTextColor(0, 0, 0)
            
            // Recipe details (left side, accounting for image)
            const textWidth = meal.image ? 110 : 170
            
            if (meal.description) {
              const descLines = doc.splitTextToSize(`Description: ${meal.description}`, textWidth)
              descLines.forEach(line => {
                if (yPosition > 270) {
                  doc.addPage()
                  yPosition = 20
                }
                doc.text(line, 25, yPosition)
                yPosition += 5
              })
              yPosition += 3
            }
            
            // Ingredients
            if (meal.ingredients && meal.ingredients.length > 0) {
              doc.text('Ingredients:', 25, yPosition)
              yPosition += 5
              
              meal.ingredients.slice(0, 6).forEach(ingredient => {
                if (yPosition > 270) {
                  doc.addPage()
                  yPosition = 20
                }
                doc.text(`• ${ingredient.name} - ${ingredient.quantity} ${ingredient.unit}`, 30, yPosition)
                yPosition += 4
              })
              
              if (meal.ingredients.length > 6) {
                doc.text(`... and ${meal.ingredients.length - 6} more ingredients`, 30, yPosition)
                yPosition += 4
              }
              yPosition += 5
            }
            
            // Basic info
            const basicInfo = [
              meal.cuisine && `Cuisine: ${meal.cuisine}`,
              meal.cookTime && `Cook Time: ${meal.cookTime} minutes`,
              meal.difficulty && `Difficulty: ${meal.difficulty}`,
              meal.likedBy && `Likes: ${meal.likedBy.length}`
            ].filter(Boolean).join(' | ')
            
            if (basicInfo) {
              doc.text(basicInfo, 25, yPosition)
              yPosition += 8
            }
            
            // Ensure we account for image height
            if (imageHeight > 0 && yPosition < (yPosition - 15 + imageHeight)) {
              yPosition = yPosition - 15 + imageHeight + 5
            }
            
            yPosition += 10 // Space between recipes
          }
          
          if (meals.length > 5) {
            doc.setFontSize(10)
            doc.setTextColor(...secondaryColor)
            doc.text(`... and ${meals.length - 5} more recipes in your collection`, 20, yPosition)
          }
        }
      }
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(...secondaryColor)
        doc.text(`Generated by SmartBite - Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10)
        doc.text(new Date().toLocaleString(), doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10)
      }
      
      // Generate filename
      const date = new Date().toISOString().split('T')[0]
      const filename = `SmartBite_My_Meals_${user?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'User'}_${date}.pdf`
      
      // Save the PDF
      doc.save(filename)
      
      return { success: true, filename }
      
    } catch (error) {
      console.error('PDF generation error:', error)
      throw new Error(`Failed to generate PDF: ${error.message}`)
    }
  }
}