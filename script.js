document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const maleBtn = document.getElementById('male-btn');
    const femaleBtn = document.getElementById('female-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const printBtn = document.getElementById('print-btn');
    const hipGroup = document.getElementById('hip-group');
    const infoIcons = document.querySelectorAll('.info-icon');
    const modal = document.getElementById('info-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const metricInfos = document.querySelectorAll('.metric-info');
    const metricCards = document.querySelectorAll('.metric-card');
    
    let selectedGender = 'male';

    // Metric Explanations Data
    const metricData = {
        age: {
            title: "Age Factor",
            content: "Age affects metabolism and body composition. As we age, muscle mass tends to decrease and fat percentage increases."
        },
        weight: {
            title: "Weight Measurement",
            content: "Your total body weight including muscles, fat, bones, and water. Measured in kilograms (kg) or pounds (lbs)."
        },
        height: {
            title: "Height Measurement",
            content: "Your standing height without shoes. Measured in centimeters (cm) or feet/inches."
        },
        waist: {
            title: "Waist Circumference",
            content: "Measured at the narrowest point between ribs and hips. Indicates abdominal fat which is linked to health risks."
        },
        hip: {
            title: "Hip Circumference",
            content: "Measured at the widest part of your hips/buttocks. Used with waist for WHR (Waist-to-Hip Ratio)."
        },
        activity: {
            title: "Activity Level",
            content: "How much you move daily. Affects your TDEE (Total Daily Energy Expenditure). Choose the closest match."
        },
        bmi: {
            title: "Body Mass Index (BMI)",
            content: "Weight-to-height ratio estimating body fat. Doesn't distinguish between muscle and fat. Categories: Underweight (<18.5), Normal (18.5-24.9), Overweight (25-29.9), Obese (30+)."
        },
        bodyfat: {
            title: "Body Fat Percentage",
            content: "The proportion of fat in your body. Essential fat: 2-5% (men), 10-13% (women). Athletes: 6-13% (men), 14-20% (women). Average: 18-24% (men), 25-31% (women)."
        },
        whr: {
            title: "Waist-to-Hip Ratio (WHR)",
            content: "Waist circumference divided by hip circumference. Higher WHR indicates more abdominal fat. Healthy: <0.90 (men), <0.85 (women). High risk: ≥0.90 (men), ≥0.85 (women)."
        },
        bmr: {
            title: "Basal Metabolic Rate (BMR)",
            content: "Calories burned at complete rest. Your body needs this energy for basic functions like breathing and circulation. Calculated using the Harris-Benedict equation."
        }
    };

    // Initialize
    hipGroup.style.display = 'none';
    showMetricInfo('bmi');

    // Event Listeners
    maleBtn.addEventListener('click', () => setGender('male'));
    femaleBtn.addEventListener('click', () => setGender('female'));
    calculateBtn.addEventListener('click', calculateAllMetrics);
    printBtn.addEventListener('click', printReport);
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    
    // Info icon clicks
    infoIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            const metric = e.target.getAttribute('data-metric');
            showModal(metricData[metric].title, metricData[metric].content);
        });
    });

    // Metric card clicks (show info in sidebar)
    metricCards.forEach(card => {
        card.addEventListener('click', () => {
            const metric = card.getAttribute('data-metric');
            showMetricInfo(metric);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Functions
    function setGender(gender) {
        selectedGender = gender;
        maleBtn.classList.toggle('active', gender === 'male');
        femaleBtn.classList.toggle('active', gender === 'female');
        hipGroup.style.display = gender === 'female' ? 'block' : 'none';
    }

    function showModal(title, content) {
        modalTitle.textContent = title;
        modalText.textContent = content;
        modal.style.display = 'flex';
    }

    function showMetricInfo(metric) {
        metricInfos.forEach(info => info.classList.remove('active'));
        document.getElementById(`${metric}-info`).classList.add('active');
    }

    function calculateAllMetrics() {
        const age = parseFloat(document.getElementById('age').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value) / 100; // cm to m
        const waist = parseFloat(document.getElementById('waist').value);
        const hip = parseFloat(document.getElementById('hip').value) || 0;
        const activityLevel = parseFloat(document.getElementById('activity').value);

        if (!age || !weight || !height || !waist || (selectedGender === 'female' && !hip)) {
            alert("Please fill all required fields!");
            return;
        }

        // 1. BMI Calculation
        const bmi = (weight / (height * height)).toFixed(1);
        document.getElementById('bmi-value').textContent = bmi;
        setBMICategory(bmi);

        // 2. Body Fat % (Deurenberg Formula)
        const bodyFat = calculateBodyFat(bmi, age);
        document.getElementById('bodyfat-value').textContent = bodyFat + "%";
        setBodyFatCategory(bodyFat);

        // 3. Waist-to-Hip Ratio (WHR)
        if (selectedGender === 'female' && hip) {
            const whr = (waist / hip).toFixed(2);
            document.getElementById('whr-value').textContent = whr;
            setWHRCategory(whr);
        } else {
            document.getElementById('whr-value').textContent = "N/A";
            document.getElementById('whr-category').textContent = "Men use Waist-to-Height";
        }

        // 4. BMR & TDEE (Harris-Benedict Equation)
        const bmr = calculateBMR(weight, height * 100, age);
        document.getElementById('bmr-value').textContent = Math.round(bmr) + " kcal";

        // 5. Advanced Insights
        generateHealthTips(bmi, bodyFat);
        generateMacronutrients(bmr, activityLevel, weight);
        generateHydration(weight);
        generateIdealWeight(height * 100);
    }

    // Helper Functions
    function setBMICategory(bmi) {
        let category, emoji;
        if (bmi < 18.5) {
            category = "Underweight";
            emoji = "🏋️‍♂️";
        } else if (bmi < 25) {
            category = "Normal";
            emoji = "✅";
        } else if (bmi < 30) {
            category = "Overweight";
            emoji = "⚠️";
        } else {
            category = "Obese";
            emoji = "❗";
        }
        document.getElementById('bmi-category').textContent = `${category} ${emoji}`;
    }

    function calculateBodyFat(bmi, age) {
        let bodyFat;
        if (selectedGender === 'male') {
            bodyFat = (1.20 * bmi) + (0.23 * age) - 16.2;
        } else {
            bodyFat = (1.20 * bmi) + (0.23 * age) - 5.4;
        }
        return Math.min(50, Math.max(5, bodyFat)).toFixed(1); // Clamp 5-50%
    }

    function setBodyFatCategory(bodyFat) {
        let category, emoji;
        const thresholds = selectedGender === 'male' 
            ? { athletic: 8, fit: 20, average: 25 } 
            : { athletic: 15, fit: 25, average: 30 };
        
        if (bodyFat < thresholds.athletic) {
            category = "Athletic";
            emoji = "🏆";
        } else if (bodyFat < thresholds.fit) {
            category = "Fit";
            emoji = "💪";
        } else if (bodyFat < thresholds.average) {
            category = "Average";
            emoji = "👍";
        } else {
            category = "High Risk";
            emoji = "🚨";
        }
        
        document.getElementById('bodyfat-category').textContent = `${category} ${emoji}`;
    }

    function setWHRCategory(whr) {
        let category, emoji;
        const threshold = selectedGender === 'male' ? 0.9 : 0.85;
        if (whr < threshold) {
            category = "Low Risk";
            emoji = "✅";
        } else {
            category = "High Risk";
            emoji = "❗";
        }
        document.getElementById('whr-category').textContent = `${category} ${emoji} (Heart Disease)`;
    }

    function calculateBMR(weight, height, age) {
        if (selectedGender === 'male') {
            return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }
    }

    function generateHealthTips(bmi, bodyFat) {
        let tips = "";
        
        if (bmi < 18.5) {
            tips = "🔹 <strong>Increase calorie intake</strong> with healthy foods (nuts, avocados, lean proteins)<br>";
            tips += "🔹 <strong>Strength training 3x/week</strong> to build muscle mass";
        } else if (bmi < 25) {
            tips = "🔹 <strong>Maintain balanced diet</strong> & regular exercise<br>";
            tips += "🔹 Consider <strong>muscle toning</strong> if body fat is high";
        } else {
            tips = "🔹 Aim for <strong>300-500 calorie deficit</strong> daily<br>";
            tips += "🔹 <strong>Cardio 4-5x/week</strong> + <strong>strength training 2-3x/week</strong>";
        }

        if (bodyFat > (selectedGender === 'male' ? 25 : 30)) {
            tips += "<br>🔹 <strong>High body fat</strong> increases diabetes risk. Focus on fat loss.";
        }

        document.getElementById('health-tips').innerHTML = `
            <h3><i class="fas fa-lightbulb"></i> Recommendations</h3>
            <div class="tips-content">${tips}</div>
        `;
    }

    function generateMacronutrients(bmr, activityLevel, weight) {
        const tdee = Math.round(bmr * activityLevel);
        const protein = Math.round(weight * 2.2); // g/day (1g per lb)
        const fats = Math.round((tdee * 0.25) / 9); // 25% from fats
        const carbs = Math.round((tdee - (protein * 4) - (fats * 9)) / 4);

        document.getElementById('macronutrients').innerHTML = `
            <h3><i class="fas fa-utensils"></i> Daily Nutrition</h3>
            <div class="macro-grid">
                <div>
                    <p class="macro-value">${tdee} kcal</p>
                    <p class="macro-label">Total Calories (TDEE)</p>
                </div>
                <div>
                    <p class="macro-value">${protein}g</p>
                    <p class="macro-label">Protein</p>
                </div>
                <div>
                    <p class="macro-value">${carbs}g</p>
                    <p class="macro-label">Carbs</p>
                </div>
                <div>
                    <p class="macro-value">${fats}g</p>
                    <p class="macro-label">Fats</p>
                </div>
            </div>
        `;
    }

    function generateHydration(weight) {
        const waterIntake = Math.round(weight * 0.033); // Liters
        document.getElementById('hydration').innerHTML = `
            <h3><i class="fas fa-tint"></i> Hydration</h3>
            <p>Drink <strong>${waterIntake}L (${waterIntake * 4} cups)</strong> of water daily.</p>
            <p class="water-tip">💧 Tip: Add lemon or cucumber for flavor!</p>
        `;
    }

    function generateIdealWeight(height) {
        let idealWeight;
        if (selectedGender === 'male') {
            idealWeight = 52 + (1.9 * (height - 152.4) / 2.54);
        } else {
            idealWeight = 49 + (1.7 * (height - 152.4) / 2.54);
        }
        
        document.getElementById('ideal-weight').innerHTML = `
            <h3><i class="fas fa-balance-scale"></i> Ideal Weight Range</h3>
            <p>For your height, a healthy weight range is:</p>
            <p class="ideal-weight-value">${Math.round(idealWeight * 0.9)}kg - ${Math.round(idealWeight * 1.1)}kg</p>
            <p class="disclaimer">* Individual needs may vary based on muscle mass</p>
        `;
    }

    function printReport() {
        window.print();
    }
});