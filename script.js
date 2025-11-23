// 1. The Database (You can add more data here!)
const careerData = {
    degree: {
        tech: {
            title: "Software Engineer",
            avg: "$110,000",
            high: "$170,000+",
            growth: "+22% (Much Faster than Avg)",
            skills: ["JavaScript/Python", "System Design", "Algorithms", "Cloud Computing (AWS)"]
        },
        finance: {
            title: "Financial Analyst",
            avg: "$95,000",
            high: "$140,000+",
            growth: "+8%",
            skills: ["Excel Modeling", "Data Analysis", "Accounting", "Financial Forecasting"]
        },
        health: {
            title: "Registered Nurse (BSN)",
            avg: "$81,000",
            high: "$120,000+",
            growth: "+6%",
            skills: ["Patient Care", "Medical Records", "Critical Thinking", "Communication"]
        },
        trades: {
            title: "Construction Manager",
            avg: "$101,000",
            high: "$160,000",
            growth: "+5%",
            skills: ["Project Management", "Budgeting", "Blueprint Reading", "Safety Codes"]
        }
    },
    nodegree: {
        tech: {
            title: "Web Developer / IT Support",
            avg: "$70,000",
            high: "$115,000",
            growth: "+13%",
            skills: ["HTML/CSS", "JavaScript", "Troubleshooting", "Networking Basics"]
        },
        finance: {
            title: "Bookkeeper",
            avg: "$45,000",
            high: "$65,000",
            growth: "-5% (Declining)",
            skills: ["QuickBooks", "Attention to Detail", "Data Entry", "Basic Math"]
        },
        health: {
            title: "Medical Assistant",
            avg: "$38,000",
            high: "$50,000",
            growth: "+14%",
            skills: ["Vital Signs", "Admin Support", "Phlebotomy", "EHR Software"]
        },
        trades: {
            title: "Electrician",
            avg: "$60,000",
            high: "$99,000+",
            growth: "+7%",
            skills: ["Circuitry", "Safety Standards", "Blueprint Reading", "Problem Solving"]
        }
    }
};

// 2. The Logic
function getCareerInsights() {
    // Get values from the HTML dropdowns
    const degreeStatus = document.getElementById("degreeSelect").value;
    const fieldStatus = document.getElementById("fieldSelect").value;

    // Find the matching data
    const data = careerData[degreeStatus][fieldStatus];

    // Update the HTML
    document.getElementById("roleTitle").innerText = data.title;
    document.getElementById("avgSalary").innerText = data.avg;
    document.getElementById("highSalary").innerText = data.high;
    document.getElementById("growthRate").innerText = data.growth;

    // Clear old list and add new skills
    const skillsList = document.getElementById("skillsList");
    skillsList.innerHTML = ""; // Wipe the slate clean
    
    data.skills.forEach(skill => {
        let li = document.createElement("li");
        li.innerText = skill;
        skillsList.appendChild(li);
    });

    // Show the results section
    document.getElementById("resultSection").classList.remove("hidden");
}
