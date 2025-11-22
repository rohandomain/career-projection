document.getElementById("projectBtn").addEventListener("click", project);

function project() {
    const career = document.getElementById('career').value.trim();
    const years = parseInt(document.getElementById('years').value.trim());
    const location = document.getElementById('location').value.trim();
    const output = document.getElementById('output');

    if(!career || !years || !location) {
        output.innerHTML = "Please fill in all fields.";
        return;
    }

    // Simple dynamic salary projection
    let baseSalary = 50000;
    if(career.toLowerCase().includes('engineer')) baseSalary = 90000 + years*2000;
    else if(career.toLowerCase().includes('designer')) baseSalary = 60000 + years*1500;
    else if(career.toLowerCase().includes('manager')) baseSalary = 80000 + years*2500;
    else baseSalary = 55000 + years*1000;

    output.innerHTML = `
        <strong>${career}</strong> in <strong>${location}</strong><br>
        With <strong>${years} years</strong> of experience:<br>
        <ul>
            <li>Estimated Salary: $${baseSalary.toLocaleString()}</li>
            <li>Job Outlook: Strong</li>
            <li>Opportunities for Skill Development: High</li>
        </ul>
    `;
}
