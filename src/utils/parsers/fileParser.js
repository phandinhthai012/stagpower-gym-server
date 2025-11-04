import pdfParse from 'pdf-parse';

/**
 * Read PDF file and extract health data (InBody template)
 * Parses InBody PDF format and extracts health metrics
 */
export const readPDFFile = async (fileBuffer) => {
    try {
        const data = await pdfParse(fileBuffer);
        const text = data.text;
        
        // Parse InBody PDF format - extract key-value pairs
        const extractedData = {};
        
        // Helper function to find number near keyword with unit
        const findValueNearKeyword = (keywords, text, unit, maxDistance = 200) => {
            // Try each keyword separately
            for (const keyword of keywords) {
                // Escape special regex characters except spaces
                const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
                const keywordPattern = new RegExp(escapedKeyword, 'i');
                const keywordMatch = text.match(keywordPattern);
                
                if (!keywordMatch) continue;
                
                const startIndex = keywordMatch.index + keywordMatch[0].length;
                const searchText = text.substring(startIndex, Math.min(startIndex + maxDistance, text.length));
                
                // Build unit pattern string based on unit type
                let unitPatternStr;
                if (unit === 'kg') {
                    unitPatternStr = '(?:kg|kilograms?)';
                } else if (unit === 'cm') {
                    unitPatternStr = '(?:cm|centimeters?)';
                } else if (unit === 'm') {
                    unitPatternStr = '(?:m|meters?|metres?)';
                } else if (unit === '%') {
                    unitPatternStr = '%';
                } else if (unit === 'kcal') {
                    unitPatternStr = '(?:kcal|kilocalories?)';
                } else {
                    unitPatternStr = unit;
                }
                
                // Pattern 1: Try to find number directly followed by unit (with or without space)
                // e.g., "156.9cm" or "59.1 kg" or "156.9 cm"
                const numberWithUnitPattern = new RegExp(`([\\d.,]+)\\s*${unitPatternStr}\\b`, 'i');
                const numberWithUnitMatch = searchText.match(numberWithUnitPattern);
                if (numberWithUnitMatch) {
                    return parseFloat(numberWithUnitMatch[1].replace(',', '.'));
                }
                
                // Pattern 2: Find any number, then check if unit appears within next 15 chars (for cases with spaces/newlines)
                const numberOnlyMatch = searchText.match(/([\d.,]+)/);
                if (numberOnlyMatch) {
                    const numberIndex = numberOnlyMatch.index;
                    const afterNumber = searchText.substring(numberIndex + numberOnlyMatch[0].length, numberIndex + numberOnlyMatch[0].length + 15);
                    const unitPattern = new RegExp(unitPatternStr, 'i');
                    if (unitPattern.test(afterNumber)) {
                        return parseFloat(numberOnlyMatch[1].replace(',', '.'));
                    }
                }
            }
            
            return null;
        };
        
        // Extract height (usually in cm, sometimes in m)
        // Try multiple approaches
        let height = findValueNearKeyword(['height', 'chiều cao', 'chieu cao'], text, 'cm', 200);
        
        // If not found in cm, try meters
        if (!height) {
            height = findValueNearKeyword(['height', 'chiều cao', 'chieu cao'], text, 'm', 200);
            if (height && height < 10) {
                // Convert m to cm if the value is less than 10 (likely in meters)
                height = height * 100;
            }
        }
        
        // Fallback: Direct regex pattern (handles both with and without space)
        if (!height) {
            const heightMatch = text.match(/(?:height|chiều cao|chieu cao)[\s:]*([\d.,]+)\s*(?:cm|m)/i);
            if (heightMatch) {
                height = parseFloat(heightMatch[1].replace(',', '.'));
                // Convert m to cm if needed
                if (heightMatch[0].toLowerCase().includes('m') && !heightMatch[0].toLowerCase().includes('cm') && height < 10) {
                    height = height * 100;
                }
            }
        }
        
        // Additional fallback: Look for pattern "Height ... 156.9cm" (case where Height and value are on different lines)
        // This handles cases where PDF parsing puts them on separate lines
        if (!height) {
            const heightSectionMatch = text.match(/height[\s\S]{0,100}?([\d.,]+)\s*(?:cm|m)\b/i);
            if (heightSectionMatch) {
                height = parseFloat(heightSectionMatch[1].replace(',', '.'));
                if (heightSectionMatch[0].toLowerCase().includes('m') && !heightSectionMatch[0].toLowerCase().includes('cm') && height < 10) {
                    height = height * 100;
                }
            }
        }
        
        // Last resort: Find number followed by cm/m anywhere near "height"
        if (!height) {
            const heightKeywordMatch = text.match(/(?:height|chiều cao|chieu cao)/i);
            if (heightKeywordMatch) {
                const startIndex = heightKeywordMatch.index;
                const searchArea = text.substring(startIndex, Math.min(startIndex + 150, text.length));
                // Try both with and without space: "156.9cm" or "156.9 cm" or "156.9 m"
                const heightValueMatch = searchArea.match(/([\d.,]+)\s*(?:cm|m)\b/i);
                if (heightValueMatch) {
                    height = parseFloat(heightValueMatch[1].replace(',', '.'));
                    if (heightValueMatch[0].toLowerCase().includes('m') && !heightValueMatch[0].toLowerCase().includes('cm') && height < 10) {
                        height = height * 100;
                    }
                }
            }
        }
        
        // Ultra fallback: Simple pattern - find "Height" followed by number and unit
        // Handles cases like "Height         156.9cm" with many spaces or newlines
        if (!height) {
            // Try pattern that allows any whitespace (including newlines) between "height" and value
            const simpleHeightMatch = text.match(/height[\s\n]+([\d.,]+)\s*(?:cm|m)\b/i);
            if (simpleHeightMatch) {
                height = parseFloat(simpleHeightMatch[1].replace(',', '.'));
                if (simpleHeightMatch[0].toLowerCase().includes('m') && !simpleHeightMatch[0].toLowerCase().includes('cm') && height < 10) {
                    height = height * 100;
                }
            }
        }
        
        // Final debug fallback: Find "Height" keyword and then scan for number.cm or number.m nearby
        if (!height) {
            const heightPos = text.toLowerCase().indexOf('height');
            if (heightPos !== -1) {
                const scanArea = text.substring(heightPos, heightPos + 80);
                // Look for patterns: "156.9cm", "156.9 cm", "156.9m", "156.9 m"
                const patterns = [
                    /([\d.,]+)\s*cm/i,
                    /([\d.,]+)\s*m\b/i
                ];
                for (const pattern of patterns) {
                    const match = scanArea.match(pattern);
                    if (match) {
                        height = parseFloat(match[1].replace(',', '.'));
                        if (pattern.source.includes('m\\b') && !scanArea.toLowerCase().includes('cm') && height < 10) {
                            height = height * 100;
                        }
                        break;
                    }
                }
            }
        }
        
        if (height) {
            extractedData.height = height;
        }
        
        // Extract weight (usually in kg)
        // Try helper function first
        let weight = findValueNearKeyword(['weight', 'cân nặng', 'can nang', 'body weight'], text, 'kg', 200);
        
        // Fallback: Direct regex pattern (handles both with and without space)
        if (!weight) {
            const weightMatch = text.match(/(?:weight|cân nặng|can nang|body weight)[\s:]*([\d.,]+)\s*kg/i);
            if (weightMatch) {
                weight = parseFloat(weightMatch[1].replace(',', '.'));
            }
        }
        
        // Additional fallback: Look for pattern "Weight ... 59.1 kg" (case where Weight and value are on different lines)
        if (!weight) {
            const weightSectionMatch = text.match(/weight[\s\S]{0,100}?([\d.,]+)\s*kg\b/i);
            if (weightSectionMatch) {
                weight = parseFloat(weightSectionMatch[1].replace(',', '.'));
            }
        }
        
        // Last resort: Find number followed by kg anywhere near "weight"
        if (!weight) {
            const weightKeywordMatch = text.match(/(?:weight|cân nặng|can nang|body weight)/i);
            if (weightKeywordMatch) {
                const startIndex = weightKeywordMatch.index;
                const searchArea = text.substring(startIndex, Math.min(startIndex + 150, text.length));
                // Try both with and without space: "59.1kg" or "59.1 kg"
                const weightValueMatch = searchArea.match(/([\d.,]+)\s*kg\b/i);
                if (weightValueMatch) {
                    weight = parseFloat(weightValueMatch[1].replace(',', '.'));
                }
            }
        }
        
        // Ultra fallback: Simple pattern - find "Weight" followed by number and unit
        // Handles cases like "Weight         59.1 kg" with many spaces or newlines
        if (!weight) {
            // Try pattern that allows any whitespace (including newlines) between "weight" and value
            const simpleWeightMatch = text.match(/weight[\s\n]+([\d.,]+)\s*kg\b/i);
            if (simpleWeightMatch) {
                weight = parseFloat(simpleWeightMatch[1].replace(',', '.'));
            }
        }
        
        // Final debug fallback: Find "Weight" keyword and then scan for number.kg nearby
        if (!weight) {
            const weightPos = text.toLowerCase().indexOf('weight');
            if (weightPos !== -1) {
                const scanArea = text.substring(weightPos, weightPos + 80);
                // Look for patterns: "59.1kg", "59.1 kg"
                const weightPattern = /([\d.,]+)\s*kg/i;
                const match = scanArea.match(weightPattern);
                if (match) {
                    weight = parseFloat(match[1].replace(',', '.'));
                }
            }
        }
        
        if (weight) {
            extractedData.weight = weight;
        }
        
        // Extract BMI
        const bmiMatch = text.match(/bmi[\s:]*([\d.,]+)/i);
        if (bmiMatch) {
            extractedData.bmi = parseFloat(bmiMatch[1].replace(',', '.'));
        }
        
        // Extract Body Fat % - MUST be "Percent Body Fat" not "Body Fat Mass"
        // Priority: look specifically for "Percent Body Fat" first
        let bodyFatPercent = null;
        
        // First, try to find "Percent Body Fat" specifically (more specific than "body fat")
        const percentBodyFatKeyword = text.match(/percent\s+body\s+fat/i);
        if (percentBodyFatKeyword) {
            const startIndex = percentBodyFatKeyword.index + percentBodyFatKeyword[0].length;
            const searchText = text.substring(startIndex, Math.min(startIndex + 100, text.length));
            const percentMatch = searchText.match(/([\d.,]+)\s*%/);
            if (percentMatch) {
                bodyFatPercent = parseFloat(percentMatch[1].replace(',', '.'));
            }
        }
        
        // Fallback: try other patterns if "Percent Body Fat" not found
        if (!bodyFatPercent) {
            bodyFatPercent = findValueNearKeyword(['percent body fat', 'body fat %', 'pbf'], text, '%');
        }
        
        if (!bodyFatPercent) {
            // Try direct regex patterns - but prioritize "percent body fat" over "body fat"
            const percentBodyFatMatch = text.match(/percent\s+body\s+fat[\s\n:]+([\d.,]+)\s*%/i);
            if (percentBodyFatMatch) {
                bodyFatPercent = parseFloat(percentBodyFatMatch[1].replace(',', '.'));
            }
        }
        
        if (bodyFatPercent !== null && !isNaN(bodyFatPercent)) {
            extractedData.bodyFatPercent = bodyFatPercent;
        }
        
                         // Extract Muscle Mass - must be specific to avoid confusion with weight
         // Look for "Muscle Mass" keyword specifically, and find the number.kg after it
         let muscleMass = null;
         
         // Priority: find "Muscle Mass" specifically
         const muscleMassKeyword = text.match(/muscle\s+mass/i);
         if (muscleMassKeyword) {
             const startIndex = muscleMassKeyword.index + muscleMassKeyword[0].length;
             const searchText = text.substring(startIndex, Math.min(startIndex + 200, text.length));
             
             // Find all number.kg values after "Muscle Mass"
             const allKgMatches = [];
             const kgPatternAfterMuscle = /([\d.,]+)\s*kg/gi;
             let match;
             while ((match = kgPatternAfterMuscle.exec(searchText)) !== null) {
                 const candidate = parseFloat(match[1].replace(',', '.'));
                 // Skip if it's the same as weight (likely wrong)
                 if (extractedData.weight && Math.abs(candidate - extractedData.weight) < 0.1) {
                     continue;
                 }
                 // Muscle mass is typically 15-50 kg for adults, much less than total weight
                 if (candidate < (extractedData.weight || 100) * 0.9 && candidate >= 10 && candidate <= 50) {
                     allKgMatches.push({ value: candidate, position: match.index });
                 }
             }
             
             // Take the first valid match (closest to "Muscle Mass")
             if (allKgMatches.length > 0) {
                 allKgMatches.sort((a, b) => a.position - b.position);
                 muscleMass = allKgMatches[0].value;
             }
         }
         
         // Fallback: try other patterns
         if (!muscleMass) {
             muscleMass = findValueNearKeyword(['muscle mass', 'skeletal muscle mass', 'smm'], text, 'kg');
             // Validate: muscle mass should be less than weight
             if (muscleMass && extractedData.weight && muscleMass >= extractedData.weight * 0.9) {
                 muscleMass = null; // Likely extracted weight instead
             }
         }
 
         if (muscleMass !== null && !isNaN(muscleMass)) {
             extractedData.muscleMass = muscleMass;
         }
        
        // Extract Visceral Fat Level - look for "Visceral Fat Level" specifically
        let visceralFatLevel = null;
        
        const visceralKeyword = text.match(/visceral\s+fat\s+level/i);
        if (visceralKeyword) {
            const startIndex = visceralKeyword.index + visceralKeyword[0].length;
            const searchText = text.substring(startIndex, Math.min(startIndex + 100, text.length));
            const visceralMatch = searchText.match(/([\d.,]+)/);
            if (visceralMatch) {
                visceralFatLevel = parseFloat(visceralMatch[1].replace(',', '.'));
            }
        }
        
        // Fallback: try other patterns
        if (!visceralFatLevel) {
            const visceralMatch = text.match(/(?:visceral\s+fat\s+level|visceral\s+fat|mỡ\s+nội\s+tạng|mo\s+noi\s+tang|vfa)[\s:]*([\d.,]+)/i);
            if (visceralMatch) {
                visceralFatLevel = parseFloat(visceralMatch[1].replace(',', '.'));
            }
        }
        
        if (visceralFatLevel !== null && !isNaN(visceralFatLevel)) {
            extractedData.visceralFatLevel = visceralFatLevel;
        }
        
        // Extract Water % - try multiple patterns
        const waterKeywords = ['total body water', 'tỷ lệ nước', 'ty le nuoc', 'tbw', 'nước', 'nuoc', 'water', '% nước', '% nuoc'];
        let waterPercent = findValueNearKeyword(waterKeywords, text, '%');
        
        // If not found, try direct regex patterns
        if (!waterPercent) {
            const waterMatch = text.match(/(?:total\s+body\s+water|tỷ\s+lệ\s+nước|ty\s+le\s+nuoc|tbw|%?\s*nước|nuoc)[\s:]*([\d.,]+)\s*%/i);
            if (waterMatch) {
                waterPercent = parseFloat(waterMatch[1].replace(',', '.'));
            }
        }
        
        // Try more flexible pattern: find number.% near water keywords
        if (!waterPercent) {
            const waterKeywordMatch = text.match(/(?:total\s+body\s+water|tỷ\s+lệ\s+nước|ty\s+le\s+nuoc|%?\s*nước|nuoc|water)/i);
            if (waterKeywordMatch) {
                const startIndex = waterKeywordMatch.index;
                const searchText = text.substring(startIndex, Math.min(startIndex + 150, text.length));
                const numberMatch = searchText.match(/([\d.,]+)\s*%/i);
                if (numberMatch) {
                    waterPercent = parseFloat(numberMatch[1].replace(',', '.'));
                }
            }
        }
        
        // Try pattern: "% Nước" or "% Water" followed by number
        if (!waterPercent) {
            const waterMatch = text.match(/%\s*(?:nước|nuoc|water)[\s:]*([\d.,]+)/i);
            if (waterMatch) {
                waterPercent = parseFloat(waterMatch[1].replace(',', '.'));
            }
        }
        
        // Try pattern: "Nước" or "Water" followed by number and %
        if (!waterPercent) {
            const waterMatch = text.match(/(?:nước|nuoc|water)[\s:]*([\d.,]+)\s*%/i);
            if (waterMatch) {
                waterPercent = parseFloat(waterMatch[1].replace(',', '.'));
            }
        }
        
        if (waterPercent !== null) {
            extractedData.waterPercent = waterPercent;
        }
        
        // Extract Bone Mass
        const boneMatch = text.match(/(?:bone mineral content|khối lượng xương|khoi luong xuong|bmc)[\s:]*([\d.,]+)\s*kg/i);
        if (boneMatch) {
            extractedData.boneMass = parseFloat(boneMatch[1].replace(',', '.'));
        }
        
        // Extract Age
        const ageMatch = text.match(/(?:age|tuổi|tuoi)[\s:]*(\d+)/i);
        if (ageMatch) {
            extractedData.age = parseInt(ageMatch[1]);
        }
        
        // Extract Gender
        const genderMatch = text.match(/(?:gender|giới tính|gioi tinh|sex)[\s:]*([^\n]+)/i);
        if (genderMatch) {
            const genderText = genderMatch[1].toLowerCase();
            if (genderText.includes('male') || genderText.includes('nam') || genderText.includes('m')) {
                extractedData.gender = 'male';
            } else if (genderText.includes('female') || genderText.includes('nữ') || genderText.includes('nu') || genderText.includes('f')) {
                extractedData.gender = 'female';
            }
        }
        
        // ===== Extract new InBody fields =====
        
        // Extract Body Fat Mass
        const bodyFatMassMatch = text.match(/(?:body fat mass|khối lượng mỡ|khoi luong mo|fat mass)[\s:]*([\d.,]+)\s*kg/i);
        if (bodyFatMassMatch) {
            extractedData.bodyFatMass = parseFloat(bodyFatMassMatch[1].replace(',', '.'));
        }
        
        // Extract Basal Metabolic Rate (BMR)
        const bmrMatch = text.match(/(?:basal metabolic rate|bmr|tỷ lệ trao đổi chất|ty le trao doi chat)[\s:]*([\d.,]+)\s*(?:kcal|kcal\/day)/i);
        if (bmrMatch) {
            extractedData.basalMetabolicRate = parseFloat(bmrMatch[1].replace(',', '.'));
        }
        
        // Extract Waist Hip Ratio
        const waistHipMatch = text.match(/(?:waist hip ratio|whr|tỷ lệ vòng eo|ty le vong eo)[\s:]*([\d.,]+)/i);
        if (waistHipMatch) {
            extractedData.waistHipRatio = parseFloat(waistHipMatch[1].replace(',', '.'));
        }
        
        // Extract InBody Score - look for "InBody Score" or "66 point"
        let inBodyScore = null;
        
        // Pattern 1: "InBody Score" followed by number
        const inBodyScoreKeyword = text.match(/inbody\s+score/i);
        if (inBodyScoreKeyword) {
            const startIndex = inBodyScoreKeyword.index + inBodyScoreKeyword[0].length;
            const searchText = text.substring(startIndex, Math.min(startIndex + 100, text.length));
            const scoreMatch = searchText.match(/(\d+)\s*(?:point|points)/i);
            if (scoreMatch) {
                inBodyScore = parseInt(scoreMatch[1]);
            } else {
                // Try just number after "InBody Score"
                const scoreMatch2 = searchText.match(/(\d+)/);
                if (scoreMatch2) {
                    inBodyScore = parseInt(scoreMatch2[1]);
                }
            }
        }
        
        // Pattern 2: "66 point" (number followed by "point")
        if (!inBodyScore) {
            const pointMatch = text.match(/(\d+)\s+point/i);
            if (pointMatch) {
                const candidate = parseInt(pointMatch[1]);
                // InBody Score is typically 0-100
                if (candidate >= 0 && candidate <= 100) {
                    inBodyScore = candidate;
                }
            }
        }
        
        // Fallback
        if (!inBodyScore) {
            const inBodyScoreMatch = text.match(/(?:inbody\s+score|inbody|điểm\s+inbody|diem\s+inbody)[\s:]*(\d+)/i);
            if (inBodyScoreMatch) {
                inBodyScore = parseInt(inBodyScoreMatch[1]);
            }
        }
        
        if (inBodyScore !== null && !isNaN(inBodyScore)) {
            extractedData.inBodyScore = inBodyScore;
        }
        
        // Helper function to extract segmental data from sections
        const extractSegmentalData = (text, sectionKeyword) => {
            const results = {};
            
            // Find the section
            const sectionIndex = text.toLowerCase().indexOf(sectionKeyword.toLowerCase());
            if (sectionIndex === -1) return results;
            
                        // Get text after the section title (next 2500 characters to ensure we capture all data)
            let sectionText = text.substring(sectionIndex, sectionIndex + 2500);

            // NEW STRATEGY: Clean text and extract pairs based on fixed order (more reliable for InBody PDFs)
            // InBody PDFs typically have 5 segments in fixed order: leftArm, rightArm, trunk, leftLeg, rightLeg
            const cleanText = sectionText.replace(/\b(normal|under|over|excellent|good|poor)\b/gi, '').trim();
            
            // Extract all mass and percent values with their positions
            const massPattern = /([\d.,]+)\s*kg/gi;
            const percentPattern = /([\d.,]+)\s*%/gi;
            const allMasses = [];
            const allPercents = [];
            
            let massMatch;
            massPattern.lastIndex = 0;
            while ((massMatch = massPattern.exec(cleanText)) !== null) {
                const mass = parseFloat(massMatch[1].replace(/,/g, '.'));
                if (!isNaN(mass)) {
                    allMasses.push({ mass, position: massMatch.index });
                }
            }
            
            let percentMatch;
            percentPattern.lastIndex = 0;
            while ((percentMatch = percentPattern.exec(cleanText)) !== null) {
                const percent = parseFloat(percentMatch[1].replace(/,/g, '.'));
                if (!isNaN(percent)) {
                    allPercents.push({ percent, position: percentMatch.index });
                }
            }
            
            // Match masses with percents based on proximity (increased distance to 300 chars to handle labels)
            const allPairs = [];
            const usedPercentIndices = new Set();
            
            allMasses.forEach(mass => {
                let closestPercent = null;
                let minDistance = Infinity;
                let closestPercentIndex = -1;
                
                allPercents.forEach((p, index) => {
                    if (usedPercentIndices.has(index)) return;
                    
                    const distance = Math.abs(p.position - mass.position);
                    // Prefer percent after mass, but allow before if close enough
                    if (distance < 300 && distance < minDistance) {
                        // Prefer percents that come after the mass
                        if (p.position >= mass.position) {
                            minDistance = distance;
                            closestPercent = p.percent;
                            closestPercentIndex = index;
                        } else if (distance < 150) {
                            // Allow before if very close (within 150 chars)
                            minDistance = distance;
                            closestPercent = p.percent;
                            closestPercentIndex = index;
                        }
                    }
                });
                
                if (closestPercent !== null && closestPercentIndex >= 0) {
                    allPairs.push({ mass: mass.mass, percent: closestPercent, position: mass.position });
                    usedPercentIndices.add(closestPercentIndex);
                }
            });
            
            // Sort pairs by position (top to bottom in PDF)
            allPairs.sort((a, b) => a.position - b.position);
            
            // STRATEGY: If we have exactly 5 pairs, assign based on fixed InBody order
            // Order: leftArm, rightArm, trunk, leftLeg, rightLeg
            if (allPairs.length === 5) {
                results.leftArm = { mass: allPairs[0].mass, percent: allPairs[0].percent };
                results.rightArm = { mass: allPairs[1].mass, percent: allPairs[1].percent };
                results.trunk = { mass: allPairs[2].mass, percent: allPairs[2].percent }; // Force trunk as 3rd
                results.leftLeg = { mass: allPairs[3].mass, percent: allPairs[3].percent };
                results.rightLeg = { mass: allPairs[4].mass, percent: allPairs[4].percent };
                
                // Return early if we successfully assigned all 5 pairs
                return results;
            }
            
            // If not exactly 5 pairs, continue with existing pattern-based logic as fallback
            // But use the cleaned text for better matching
            sectionText = cleanText;

            // Multiple patterns to match various formats
            // Format 1: "Left Arm 1.81 kg (90.2 %)" - single line with parentheses
            // Format 2: "Left Arm\n1.81 kg\n90.2 %" - multi-line
            // Format 3: "Left Arm: 1.81 kg 90.2 %" - with colon
            const patterns = [
                // English patterns - flexible format
                /(left\s+arm|right\s+arm|left\s+leg|right\s+leg|trunk)[\s:]*([\d.,]+)\s*kg[^0-9]*\(?([\d.,]+)\s*%/gi,
                // English patterns - multi-line format (number and percent on separate lines)
                /(left\s+arm|right\s+arm|left\s+leg|right\s+leg|trunk)[\s:]*([\d.,]+)\s*kg[\s\n]+([\d.,]+)\s*%/gi,
                // Vietnamese patterns (without diacritics)
                /(tay\s+trai|tay\s+phai|chan\s+trai|chan\s+phai|than)[\s:]*([\d.,]+)\s*kg[^0-9]*\(?([\d.,]+)\s*%/gi,
                // Vietnamese patterns (with diacritics)
                /(tay\s+trái|tay\s+phải|chân\s+trái|chân\s+phải|thân)[\s:]*([\d.,]+)\s*kg[^0-9]*\(?([\d.,]+)\s*%/gi,
                // More flexible pattern: allows any whitespace between parts
                /(left\s+arm|right\s+arm|left\s+leg|right\s+leg|trunk)[\s:]*([\d.,]+)[\s]*kg[\s\n]*\(?([\d.,]+)[\s]*%?\)?/gi
            ];
            
            // Try each pattern
            patterns.forEach(pattern => {
                let match;
                // Reset lastIndex to avoid issues with global regex
                pattern.lastIndex = 0;
                while ((match = pattern.exec(sectionText)) !== null) {
                    const part = match[1].toLowerCase().trim();
                    const massStr = match[2].replace(/,/g, '.');
                    const percentStr = match[3].replace(/,/g, '.').replace(/[^0-9.]/g, '');
                    
                    const mass = parseFloat(massStr);
                    const percent = parseFloat(percentStr);
                    
                    // Skip if values are invalid
                    if (isNaN(mass) || isNaN(percent)) continue;
                    
                    // Map to standard keys
                    if ((part.includes('left') && part.includes('arm')) || (part.includes('tay') && (part.includes('trai') || part.includes('trái')))) {
                        if (!results.leftArm || (results.leftArm.mass === undefined)) {
                            results.leftArm = { mass, percent };
                        }
                    } else if ((part.includes('right') && part.includes('arm')) || (part.includes('tay') && (part.includes('phai') || part.includes('phải')))) {
                        if (!results.rightArm || (results.rightArm.mass === undefined)) {
                            results.rightArm = { mass, percent };
                        }
                    } else if ((part.includes('left') && part.includes('leg')) || (part.includes('chan') && (part.includes('trai') || part.includes('trái')))) {
                        if (!results.leftLeg || (results.leftLeg.mass === undefined)) {
                            results.leftLeg = { mass, percent };
                        }
                    } else if ((part.includes('right') && part.includes('leg')) || (part.includes('chan') && (part.includes('phai') || part.includes('phải')))) {
                        if (!results.rightLeg || (results.rightLeg.mass === undefined)) {
                            results.rightLeg = { mass, percent };
                        }
                    } else if (part.includes('trunk') || part.includes('than') || part.includes('thân')) {
                        if (!results.trunk || (results.trunk.mass === undefined)) {
                            results.trunk = { mass, percent };
                        }
                    }
                                }
            });
            
            // Additional strategy: If no results or incomplete results, try pattern matching based on position and value ranges
            // InBody format often has numbers in sequence: arm values (1-4 kg), trunk (10-20 kg), leg values (4-10 kg)
            const expectedParts = ['leftArm', 'rightArm', 'leftLeg', 'rightLeg', 'trunk'];
            const missingParts = expectedParts.filter(part => !results[part]);
            
            if (missingParts.length > 0) {
                                // Find all number.kg patterns followed by number.% in the section
                const allPairs = [];
                const kgPattern = /([\d.,]+)\s*kg/gi;

                // First, find all kg values and all % values
                const kgMatches = [];
                const percentMatches = [];

                kgPattern.lastIndex = 0; // Reset regex
                let kgMatch;
                while ((kgMatch = kgPattern.exec(sectionText)) !== null) {
                    const mass = parseFloat(kgMatch[1].replace(/,/g, '.'));
                    if (!isNaN(mass)) {
                        kgMatches.push({ mass, position: kgMatch.index });
                    }
                }
                
                const percentPattern = /([\d.,]+)\s*%/gi;
                let percentMatch;
                while ((percentMatch = percentPattern.exec(sectionText)) !== null) {
                    const percent = parseFloat(percentMatch[1].replace(/,/g, '.'));
                    if (!isNaN(percent)) {
                        percentMatches.push({ percent, position: percentMatch.index });
                    }
                }
                
                                                                  // Match each kg with nearest percent (within reasonable distance)
                 // Use a used percent tracker to avoid reusing the same percent for multiple kg values
                 const usedPercentIndices = new Set();

                 // First pass: Match kg values with nearby percents (prefer percents after kg)
                 kgMatches.forEach(kg => {
                     // Find closest percent within 250 characters that hasn't been used yet
                     // Increased distance to handle cases with text like "Normal" between values
                     let closestPercent = null;
                     let minDistance = Infinity;
                     let closestPercentIndex = -1;

                     percentMatches.forEach((p, index) => {
                         if (usedPercentIndices.has(index)) return; // Skip already used percents

                         const distance = Math.abs(p.position - kg.position);
                         // Percent should come after kg in most cases (within 250 chars to handle text between)
                         if (distance < 250 && p.position >= kg.position && distance < minDistance) {
                             minDistance = distance;
                             closestPercent = p.percent;
                             closestPercentIndex = index;
                         }
                     });

                     // Fallback: if no percent after, try before (within shorter distance)
                     if (!closestPercent) {
                         percentMatches.forEach((p, index) => {
                             if (usedPercentIndices.has(index)) return; // Skip already used percents

                             const distance = Math.abs(p.position - kg.position);
                             if (distance < 100 && distance < minDistance) {
                                 minDistance = distance;
                                 closestPercent = p.percent;
                                 closestPercentIndex = index;
                             }
                         });
                     }

                     if (closestPercent !== null && closestPercentIndex >= 0) {
                         allPairs.push({ mass: kg.mass, percent: closestPercent, position: kg.position });
                         usedPercentIndices.add(closestPercentIndex); // Mark this percent as used
                     }
                 });

                                   // Second pass: If we have unmatched kg values and unmatched percents, try to match them
                  // This handles edge cases where distance is too large but they should still be paired
                  const unmatchedKg = kgMatches.filter((kg, index) => {
                      // Check if this kg was matched
                      return !allPairs.some(pair => Math.abs(pair.position - kg.position) < 0.1);
                  });

                  const unmatchedPercent = percentMatches.filter((p, index) => {
                      return !usedPercentIndices.has(index);
                  });

                  // Try to match unmatched kg with unmatched percents
                  if (unmatchedKg.length > 0 && unmatchedPercent.length > 0) {
                      unmatchedKg.forEach(kg => {
                          // Find closest unmatched percent (relaxed distance for this pass)
                          let closestPercent = null;
                          let minDistance = Infinity;
                          let closestPercentIndex = -1;

                          unmatchedPercent.forEach((p, index) => {
                              const distance = Math.abs(p.position - kg.position);
                              // For unmatched pairs, allow larger distance (up to 600 chars to handle cases with text like "Normal" between)
                              if (distance < 600 && distance < minDistance) {
                                  minDistance = distance;
                                  closestPercent = p.percent;
                                  closestPercentIndex = percentMatches.indexOf(p);
                              }
                          });

                          if (closestPercent !== null && closestPercentIndex >= 0 && !usedPercentIndices.has(closestPercentIndex)) {
                              allPairs.push({ mass: kg.mass, percent: closestPercent, position: kg.position });
                              usedPercentIndices.add(closestPercentIndex);
                          }
                      });
                  }

                  // Third pass: If still unmatched, try to match based on value ranges
                  // This is a last resort to ensure all values are matched
                  const stillUnmatchedKg = kgMatches.filter((kg) => {
                      return !allPairs.some(pair => Math.abs(pair.position - kg.position) < 0.1);
                  });

                  const stillUnmatchedPercent = percentMatches.filter((p, index) => {
                      return !usedPercentIndices.has(index);
                  });

                  // For lean section, typical values: arms 1-4 kg (80-100%), trunk 10-25 kg (80-100%), legs 4-10 kg (70-80%)
                  // For fat section: arms 1-2 kg (100-200%), trunk 8-15 kg (200-250%), legs 2-5 kg (120-130%)
                  if (stillUnmatchedKg.length > 0 && stillUnmatchedPercent.length > 0) {
                      const isLeanSection = sectionKeyword.toLowerCase().includes('lean');
                      
                      stillUnmatchedKg.forEach(kg => {
                          // Try to match based on typical percent ranges
                          let bestMatch = null;
                          let bestMatchIndex = -1;
                          let bestScore = 0;

                          stillUnmatchedPercent.forEach((p, index) => {
                              if (usedPercentIndices.has(percentMatches.indexOf(p))) return;

                              let score = 0;
                              
                              if (isLeanSection) {
                                  // Lean section ranges
                                  if (kg.mass >= 10 && kg.mass <= 25 && p.percent >= 80 && p.percent <= 100) {
                                      score = 10; // Trunk match
                                  } else if (kg.mass >= 4 && kg.mass <= 10 && p.percent >= 70 && p.percent <= 80) {
                                      score = 8; // Leg match
                                  } else if (kg.mass >= 1 && kg.mass <= 4 && p.percent >= 80 && p.percent <= 100) {
                                      score = 7; // Arm match
                                  }
                              } else {
                                  // Fat section ranges
                                  if (kg.mass >= 8 && kg.mass <= 15 && p.percent >= 200 && p.percent <= 250) {
                                      score = 10; // Trunk match
                                  } else if (kg.mass >= 2 && kg.mass <= 5 && p.percent >= 120 && p.percent <= 135) {
                                      score = 8; // Leg match
                                  } else if (kg.mass >= 1 && kg.mass <= 2 && p.percent >= 100 && p.percent <= 200) {
                                      score = 7; // Arm match
                                  }
                              }

                              // Also consider distance (closer is better)
                              const distance = Math.abs(p.position - kg.position);
                              if (distance < 1000) {
                                  // Increased distance threshold and more generous bonus
                                  score += (1000 - distance) / 80; // Add bonus for closer matches
                              }

                              if (score > bestScore) {
                                  bestScore = score;
                                  bestMatch = p.percent;
                                  bestMatchIndex = percentMatches.indexOf(p);
                              }
                          });

                                                    // Lower threshold to ensure matches are made (was > 5, now > 0 for high-scoring matches or > 2 for others)
                          // This ensures that 16.7 kg with 92.2% (score = 10+) will always be matched
                          const threshold = bestScore >= 10 ? 0 : (bestScore >= 8 ? 2 : 5);
                          
                          if (bestMatch !== null && bestMatchIndex >= 0 && bestScore > threshold && !usedPercentIndices.has(bestMatchIndex)) {
                              allPairs.push({ mass: kg.mass, percent: bestMatch, position: kg.position });
                              usedPercentIndices.add(bestMatchIndex);
                          }
                      });
                  }

                  // Fourth pass: Force match remaining unmatched values, especially trunk
                  // This ensures we always get complete segmental data
                  const finalUnmatchedKg = kgMatches.filter((kg) => {
                      return !allPairs.some(pair => Math.abs(pair.position - kg.position) < 0.1);
                  });

                  const finalUnmatchedPercent = percentMatches.filter((p, index) => {
                      return !usedPercentIndices.has(index);
                  });

                  // If we have unmatched values, try to match them (not just when exactly 5)
                  if (finalUnmatchedKg.length > 0 && finalUnmatchedPercent.length > 0) {
                      const isLeanSection = sectionKeyword.toLowerCase().includes('lean');
                      
                      // Priority 1: Match trunk first (ALWAYS check, even if results.trunk exists, to ensure correct trunk)
                      if (isLeanSection) {
                          // Find trunk: kg in range 10-25 with percent 80-100
                          const trunkKg = finalUnmatchedKg.find(kg => kg.mass >= 10 && kg.mass <= 25);
                          if (trunkKg) {
                              const trunkPercent = finalUnmatchedPercent.find(p => p.percent >= 80 && p.percent <= 100);
                              if (trunkPercent) {
                                  const trunkPercentIndex = percentMatches.indexOf(trunkPercent);
                                  if (!usedPercentIndices.has(trunkPercentIndex)) {
                                      allPairs.push({ mass: trunkKg.mass, percent: trunkPercent.percent, position: trunkKg.position });
                                      usedPercentIndices.add(trunkPercentIndex);
                                      // Remove from unmatched lists
                                      finalUnmatchedKg.splice(finalUnmatchedKg.indexOf(trunkKg), 1);
                                      finalUnmatchedPercent.splice(finalUnmatchedPercent.indexOf(trunkPercent), 1);
                                  }
                              }
                          }
                      } else {
                          // Fat section: Match trunk if missing or incorrect
                          const trunkKg = finalUnmatchedKg.find(kg => kg.mass >= 8 && kg.mass <= 15);
                          if (trunkKg) {
                              const trunkPercent = finalUnmatchedPercent.find(p => p.percent >= 200 && p.percent <= 250);
                              if (trunkPercent) {
                                  const trunkPercentIndex = percentMatches.indexOf(trunkPercent);
                                  if (!usedPercentIndices.has(trunkPercentIndex)) {
                                      allPairs.push({ mass: trunkKg.mass, percent: trunkPercent.percent, position: trunkKg.position });
                                      usedPercentIndices.add(trunkPercentIndex);
                                      // Remove from unmatched lists
                                      finalUnmatchedKg.splice(finalUnmatchedKg.indexOf(trunkKg), 1);
                                      finalUnmatchedPercent.splice(finalUnmatchedPercent.indexOf(trunkPercent), 1);
                                  }
                              }
                          }
                      }
                      
                      // Priority 2: For each remaining unmatched kg, find the best unmatched percent based on ranges
                      finalUnmatchedKg.forEach(kg => {
                          let bestMatch = null;
                          let bestMatchIndex = -1;
                          let bestScore = -1;

                          finalUnmatchedPercent.forEach((p, index) => {
                              if (usedPercentIndices.has(percentMatches.indexOf(p))) return;

                              let score = 0;
                              
                              if (isLeanSection) {
                                  // Lean section: prioritize trunk match (16.7 kg with 92.2%)
                                  if (kg.mass >= 10 && kg.mass <= 25 && p.percent >= 80 && p.percent <= 100) {
                                      score = 1000; // Extremely high score for trunk (to ensure it's matched)
                                  } else if (kg.mass >= 4 && kg.mass <= 10 && p.percent >= 70 && p.percent <= 80) {
                                      score = 50; // Leg match
                                  } else if (kg.mass >= 1 && kg.mass <= 4 && p.percent >= 80 && p.percent <= 100) {
                                      score = 30; // Arm match
                                  }
                              } else {
                                  // Fat section
                                  if (kg.mass >= 8 && kg.mass <= 15 && p.percent >= 200 && p.percent <= 250) {
                                      score = 1000; // Trunk match
                                  } else if (kg.mass >= 2 && kg.mass <= 5 && p.percent >= 120 && p.percent <= 135) {
                                      score = 50; // Leg match
                                  } else if (kg.mass >= 1 && kg.mass <= 2 && p.percent >= 100 && p.percent <= 200) {
                                      score = 30; // Arm match
                                  }
                              }

                              // Distance bonus (closer is better, but less important than range match)
                              const distance = Math.abs(p.position - kg.position);
                              score += Math.max(0, (3000 - distance) / 30); // Even more generous distance allowance

                              if (score > bestScore) {
                                  bestScore = score;
                                  bestMatch = p.percent;
                                  bestMatchIndex = percentMatches.indexOf(p);
                              }
                          });

                          // If we found a match with any positive score, use it
                          if (bestMatch !== null && bestMatchIndex >= 0 && bestScore > 0 && !usedPercentIndices.has(bestMatchIndex)) {
                              allPairs.push({ mass: kg.mass, percent: bestMatch, position: kg.position });
                              usedPercentIndices.add(bestMatchIndex);
                          } else if (finalUnmatchedPercent.length === 1 && finalUnmatchedKg.length === 1) {
                              // Last resort: if only one unmatched kg and one unmatched percent, match them
                              allPairs.push({ mass: kg.mass, percent: finalUnmatchedPercent[0].percent, position: kg.position });
                              usedPercentIndices.add(percentMatches.indexOf(finalUnmatchedPercent[0]));
                          }
                      });
                  }
                 
                // Sort by position (top to bottom in PDF)
                allPairs.sort((a, b) => a.position - b.position);
                
                // Try to identify body parts by typical value ranges:
                // Arms: usually 1-4 kg (smaller values)
                // Legs: usually 4-10 kg (medium values)
                // Trunk: usually 10-25 kg (largest value)
                
                if (allPairs.length >= 4) {
                    const sortedByMass = [...allPairs].sort((a, b) => a.mass - b.mass);
                    
                                                                                   // Find trunk (usually the largest, around 10-25 kg for lean, or largest for fat)
                      // For lean analysis: trunk is typically 10-25 kg (the largest value in this range)
                      // For fat analysis: trunk might be 5-15 kg (also usually the largest)
                      let trunkPair = null;
                      
                      const isLeanSection = sectionKeyword.toLowerCase().includes('lean');
                      
                      // Strategy 0: Check if trunk already exists in results, but verify it's correct
                      // If existing trunk is not in typical range, we'll overwrite it
                      if (results.trunk) {
                          if (isLeanSection) {
                              // For lean: verify trunk is in range 10-25 kg
                              if (results.trunk.mass >= 10 && results.trunk.mass <= 25) {
                                  // Trunk is valid, keep it
                                  trunkPair = allPairs.find(p => 
                                      Math.abs(p.mass - results.trunk.mass) < 0.1 &&
                                      Math.abs(p.percent - results.trunk.percent) < 0.1
                                  );
                              }
                          } else {
                              // For fat: verify trunk is in range 8-15 kg
                              if (results.trunk.mass >= 8 && results.trunk.mass <= 15) {
                                  // Trunk is valid, keep it
                                  trunkPair = allPairs.find(p => 
                                      Math.abs(p.mass - results.trunk.mass) < 0.1 &&
                                      Math.abs(p.percent - results.trunk.percent) < 0.1
                                  );
                              }
                          }
                      }
                      
                      // Strategy 1: Find trunk in typical range (10-25 kg for lean, 8-15 kg for fat)
                      // This will find 16.7 kg with 92.2% for lean section
                      if (!trunkPair) {
                          trunkPair = allPairs.find(p => {
                              if (isLeanSection) {
                                  // For lean: trunk is typically 10-25 kg with percent 80-100%
                                  return p.mass >= 10 && p.mass <= 25 && p.percent >= 80 && p.percent <= 100;
                              } else {
                                  // For fat: trunk might be 8-15 kg with percent 200-250%
                                  return p.mass >= 8 && p.mass <= 15 && p.percent >= 200 && p.percent <= 250;
                              }
                          });
                      }
                      
                      // Strategy 1b: If not found with percent constraint, try without percent constraint
                      if (!trunkPair) {
                          trunkPair = allPairs.find(p => {
                              if (isLeanSection) {
                                  // For lean: trunk is typically 10-25 kg
                                  return p.mass >= 10 && p.mass <= 25;
                              } else {
                                  // For fat: trunk might be 8-15 kg
                                  return p.mass >= 8 && p.mass <= 15;
                              }
                          });
                      }
                      
                      // Strategy 2: If no trunk found in range, check if we have 5 values - the largest might be trunk
                      if (!trunkPair && allPairs.length >= 5) {
                          const largest = sortedByMass[sortedByMass.length - 1];
                          // If largest is >= 8 kg and not already assigned as arm/leg, it's likely trunk
                          if (largest.mass >= 8) {
                              // Check if this largest value is not an arm (arms are typically < 5 kg)
                              const isNotArm = largest.mass >= 5;
                              // Check if there are smaller values that could be legs/arms
                              const smallerValues = sortedByMass.filter(p => p.mass < largest.mass);
                              if (isNotArm && smallerValues.length >= 2) {
                                  trunkPair = largest;
                              }
                          }
                      }
                      
                      // Strategy 3: If still no trunk, but we have exactly 5 pairs, try to identify by elimination
                      if (!trunkPair && allPairs.length === 5) {
                          // Find values that are already identified
                          const identifiedMasses = [];
                          if (results.leftArm) identifiedMasses.push(results.leftArm.mass);
                          if (results.rightArm) identifiedMasses.push(results.rightArm.mass);
                          if (results.leftLeg) identifiedMasses.push(results.leftLeg.mass);
                          if (results.rightLeg) identifiedMasses.push(results.rightLeg.mass);
                          
                          // Find the largest value that's not identified yet
                          const unidentifiedPairs = allPairs.filter(p => 
                              !identifiedMasses.some(im => Math.abs(im - p.mass) < 0.1)
                          );
                          
                          if (unidentifiedPairs.length > 0) {
                              const largestUnidentified = unidentifiedPairs.sort((a, b) => b.mass - a.mass)[0];
                              // For lean section, trunk should be >= 10 kg; for fat, >= 8 kg
                              if ((isLeanSection && largestUnidentified.mass >= 10) || 
                                  (!isLeanSection && largestUnidentified.mass >= 8)) {
                                  trunkPair = largestUnidentified;
                              }
                          }
                      }
                      
                      // Strategy 4: If still no trunk found, look for the value that's significantly larger than legs
                      // This handles cases where trunk might be missed due to matching issues
                      if (!trunkPair && allPairs.length >= 5) {
                          // Find the value that's much larger than typical leg values (4-10 kg for lean, 2-5 kg for fat)
                          const potentialTrunk = allPairs.find(p => {
                              if (isLeanSection) {
                                  // For lean: trunk should be > 10 kg (much larger than legs which are 4-10 kg)
                                  return p.mass > 10;
                              } else {
                                  // For fat: trunk should be > 8 kg (much larger than legs which are 2-5 kg)
                                  return p.mass > 8;
                              }
                          });
                          
                          if (potentialTrunk) {
                              // Make sure it's not already assigned
                              const isAlreadyAssigned = 
                                  (results.leftArm && Math.abs(results.leftArm.mass - potentialTrunk.mass) < 0.1) ||
                                  (results.rightArm && Math.abs(results.rightArm.mass - potentialTrunk.mass) < 0.1) ||
                                  (results.leftLeg && Math.abs(results.leftLeg.mass - potentialTrunk.mass) < 0.1) ||
                                  (results.rightLeg && Math.abs(results.rightLeg.mass - potentialTrunk.mass) < 0.1);
                              
                              if (!isAlreadyAssigned) {
                                  trunkPair = potentialTrunk;
                              }
                          }
                      }
                      
                                            // Strategy 5: If still no trunk but we have exactly 5 pairs, the largest unmatched must be trunk
                      if (!trunkPair && allPairs.length === 5) {
                          const identifiedMasses = [];
                          if (results.leftArm) identifiedMasses.push(results.leftArm.mass);
                          if (results.rightArm) identifiedMasses.push(results.rightArm.mass);
                          if (results.leftLeg) identifiedMasses.push(results.leftLeg.mass);
                          if (results.rightLeg) identifiedMasses.push(results.rightLeg.mass);
                          
                          // Find pairs that haven't been assigned yet
                          const unassignedPairs = allPairs.filter(p =>
                              !identifiedMasses.some(im => Math.abs(im - p.mass) < 0.1)
                          );
                          
                          if (unassignedPairs.length > 0) {
                              // The largest unassigned pair must be trunk (since we have 5 pairs total)
                              const largestUnassigned = unassignedPairs.sort((a, b) => b.mass - a.mass)[0];
                              // Only assign as trunk if mass >= 8 kg (reasonable threshold for trunk)
                              if (largestUnassigned.mass >= 8) {
                                  trunkPair = largestUnassigned;
                              }
                          }
                      }

                      // Always assign trunk if found (even if results.trunk already exists, overwrite it with the correct value)
                      // BUT: Before assigning, also check if there's a better trunk candidate (e.g., 16.7 kg)
                      // This ensures we always get the correct trunk, even if it was matched incorrectly earlier
                      let finalTrunkPair = trunkPair;
                      
                      // Additional check: Look for the best trunk candidate in allPairs
                      // This handles cases where trunk might have been matched but not identified correctly
                      if (isLeanSection && allPairs.length > 0) {
                          // Find all potential trunk pairs (mass 10-25 kg)
                          const allPotentialTrunks = allPairs.filter(p => p.mass >= 10 && p.mass <= 25);
                          
                          if (allPotentialTrunks.length > 0) {
                              // Prefer the one with percent in range 80-100%
                              const bestTrunk = allPotentialTrunks.find(p => p.percent >= 80 && p.percent <= 100) ||
                                              allPotentialTrunks[0]; // Fallback to first if no percent match
                              
                              // Check if it's not already assigned as arm or leg
                              const isNotAssigned = (!results.leftArm || Math.abs(results.leftArm.mass - bestTrunk.mass) >= 0.1) &&
                                                  (!results.rightArm || Math.abs(results.rightArm.mass - bestTrunk.mass) >= 0.1) &&
                                                  (!results.leftLeg || Math.abs(results.leftLeg.mass - bestTrunk.mass) >= 0.1) &&
                                                  (!results.rightLeg || Math.abs(results.rightLeg.mass - bestTrunk.mass) >= 0.1);
                              
                              if (isNotAssigned) {
                                  finalTrunkPair = bestTrunk;
                              } else if (!finalTrunkPair) {
                                  // If current trunk not found but bestTrunk is assigned elsewhere,
                                  // it means it was wrongly assigned - we'll still use it as trunk
                                  finalTrunkPair = bestTrunk;
                              }
                          }
                      }
                      
                      if (finalTrunkPair) {
                          // If trunk was wrongly assigned to leg/arm, clear those assignments
                          if (results.leftLeg && Math.abs(results.leftLeg.mass - finalTrunkPair.mass) < 0.1) {
                              delete results.leftLeg;
                          }
                          if (results.rightLeg && Math.abs(results.rightLeg.mass - finalTrunkPair.mass) < 0.1) {
                              delete results.rightLeg;
                          }
                          if (results.leftArm && Math.abs(results.leftArm.mass - finalTrunkPair.mass) < 0.1) {
                              delete results.leftArm;
                          }
                          if (results.rightArm && Math.abs(results.rightArm.mass - finalTrunkPair.mass) < 0.1) {
                              delete results.rightArm;
                          }
                          
                          results.trunk = { mass: finalTrunkPair.mass, percent: finalTrunkPair.percent };
                          trunkPair = finalTrunkPair; // Update for use in leg filtering
                      }

                    // Find arms (usually smallest, 1-4 kg) - only if missing
                    if (!results.leftArm || !results.rightArm) {
                        const armPairs = allPairs.filter(p => {
                            // Arms are typically smallest values
                            return p.mass >= 1 && p.mass <= 4 && (!trunkPair || p.mass !== trunkPair.mass);
                        }).sort((a, b) => a.position - b.position);
                        
                        if (armPairs.length >= 2) {
                            if (!results.leftArm) results.leftArm = { mass: armPairs[0].mass, percent: armPairs[0].percent };
                            if (!results.rightArm) results.rightArm = { mass: armPairs[1].mass, percent: armPairs[1].percent };
                        } else if (armPairs.length === 1) {
                            if (!results.leftArm) results.leftArm = { mass: armPairs[0].mass, percent: armPairs[0].percent };
                        }
                    }
                    
                                                                                   // Find legs (usually 4-10 kg for lean, or medium values like 2-5 kg for fat) - only if missing
                      if (!results.leftLeg || !results.rightLeg) {
                          const remainingPairs = allPairs.filter(p => {
                              // Exclude trunk and arms
                              const isTrunk = trunkPair && Math.abs(p.mass - trunkPair.mass) < 0.1;
                              const isArm = (results.leftArm && Math.abs(p.mass - results.leftArm.mass) < 0.1) ||
                                           (results.rightArm && Math.abs(p.mass - results.rightArm.mass) < 0.1);
                              return !isTrunk && !isArm;
                          });
                          
                          // Legs are typically the remaining medium values
                          // For lean: 4-10 kg, for fat: could be 2-5 kg
                          let legPairs = remainingPairs
                              .filter(p => {
                                  // Legs are usually medium values - not too small (arms) and not too large (trunk)
                                  // For lean analysis: 4-10 kg
                                  // For fat analysis: 2-5 kg (smaller values)
                                  const isLeanSection = sectionKeyword.toLowerCase().includes('lean');
                                  if (isLeanSection) {
                                      return p.mass >= 4 && p.mass <= 10;
                                  } else {
                                      // Fat section - legs are typically 2-5 kg
                                      return p.mass >= 2 && p.mass <= 5;
                                  }
                              })
                              .sort((a, b) => a.position - b.position);
                          
                          // If no legs found with strict range, try more flexible approach
                          if (legPairs.length < 2 && remainingPairs.length >= 2) {
                              // Use all remaining pairs as potential legs (they're not trunk or arms)
                              legPairs = remainingPairs.sort((a, b) => a.position - b.position);
                          }
                          
                          if (legPairs.length >= 2) {
                              if (!results.leftLeg) results.leftLeg = { mass: legPairs[0].mass, percent: legPairs[0].percent };
                              if (!results.rightLeg) results.rightLeg = { mass: legPairs[1].mass, percent: legPairs[1].percent };
                          } else if (legPairs.length === 1) {
                              if (!results.leftLeg) results.leftLeg = { mass: legPairs[0].mass, percent: legPairs[0].percent };
                          }
                      }
                } else if (allPairs.length >= 2) {
                    // Fallback: assign based on position and typical ranges
                    const sortedByMass = [...allPairs].sort((a, b) => a.mass - b.mass);
                    const sortedByPosition = [...allPairs].sort((a, b) => a.position - b.position);
                    
                    // Smallest values are usually arms
                    const smallPairs = sortedByMass.filter(p => p.mass < 5);
                    // Largest value might be trunk
                    const largestPair = sortedByMass[sortedByMass.length - 1];
                    // Medium values are legs
                    const mediumPairs = sortedByMass.filter(p => p.mass >= 4 && p.mass <= 10);
                    
                    // Assign arms
                    if (smallPairs.length >= 2 && (!results.leftArm || !results.rightArm)) {
                        const armPairs = sortedByPosition.filter(p => smallPairs.some(sp => Math.abs(sp.mass - p.mass) < 0.1));
                        if (armPairs.length >= 2) {
                            if (!results.leftArm) results.leftArm = { mass: armPairs[0].mass, percent: armPairs[0].percent };
                            if (!results.rightArm) results.rightArm = { mass: armPairs[1].mass, percent: armPairs[1].percent };
                        }
                    }
                    
                    // Assign trunk if large enough
                    if (largestPair && largestPair.mass >= 10 && !results.trunk) {
                        results.trunk = { mass: largestPair.mass, percent: largestPair.percent };
                    }
                    
                    // Assign legs from remaining values
                    if (mediumPairs.length >= 2 && (!results.leftLeg || !results.rightLeg)) {
                        const legPairs = sortedByPosition.filter(p => {
                            const isLarge = largestPair && Math.abs(p.mass - largestPair.mass) < 0.1;
                            const isSmall = smallPairs.some(sp => Math.abs(sp.mass - p.mass) < 0.1);
                            return !isLarge && !isSmall;
                        });
                        
                        if (legPairs.length >= 2) {
                            if (!results.leftLeg) results.leftLeg = { mass: legPairs[0].mass, percent: legPairs[0].percent };
                            if (!results.rightLeg) results.rightLeg = { mass: legPairs[1].mass, percent: legPairs[1].percent };
                        }
                    } else if (largestPair && largestPair.mass < 10 && !results.trunk && allPairs.length === 5) {
                        // If largest is not big enough to be trunk, might be leg
                        // And we have 5 values total (2 arms, 2 legs, 1 trunk or similar)
                        const remainingForTrunk = sortedByMass.filter(p => p.mass >= 8 && p.mass <= 25);
                        if (remainingForTrunk.length > 0) {
                            const trunkCandidate = remainingForTrunk[remainingForTrunk.length - 1];
                            if (!results.trunk) {
                                results.trunk = { mass: trunkCandidate.mass, percent: trunkCandidate.percent };
                            }
                        }
                    }
                }
            }

            return results;
        };
        
        // Extract Segmental Lean Analysis
        const leanSection = extractSegmentalData(text, 'segmental lean analysis');
        if (Object.keys(leanSection).length > 0) {
            extractedData.segmentalLeanAnalysis = leanSection;
        }
        
        // Extract Segmental Fat Analysis
        const fatSection = extractSegmentalData(text, 'segmental fat analysis');
        if (Object.keys(fatSection).length > 0) {
            extractedData.segmentalFatAnalysis = fatSection;
        }
        
        // Return as array format (similar to Excel) for compatibility
        return [extractedData];
    } catch (error) {
        throw new Error(`Lỗi đọc file PDF: ${error.message}`);
    }
};

/**
 * Read health file - only supports PDF format
 */
export const readHealthFile = async (fileBuffer, mimeType) => {
    if (mimeType === 'application/pdf') {
        return await readPDFFile(fileBuffer);
    } else {
        throw new Error('Định dạng file không được hỗ trợ. Chỉ hỗ trợ file PDF (.pdf)');
    }
};