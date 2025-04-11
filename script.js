const timetable = {
    "Monday A": "Study Hall 1 - Room 122, Study Hall 1 - Room 109, Physics - Physics Lab, Physics - Physics Lab, Well Being - Room 115, Math AA - Room 216",
    "Tuesday A": "Study Hall 1 - Room 103, Study Hall 1 - Room 109, Physics - Physics Lab, Physics - Physics Lab, Flex Events, Math AA - Room 216",
    "Wednesday A": "Physics - Physics Lab, English - Room 103, TOK - Room 109, Math AA - Room 216, College Counselling - Room 116, Study Hall 1 - Room 103",
    "Thursday A": "English - Room 225, TOK - Room 109, Math AA - Room 216, Study Hall 1 - Room 103, English - Room 103",
    "Friday A": "Research - Library, Flex Events, English - Room 103, PHE, Math AA - Room 216, English - Room 225",
    "Monday B": "Study Hall 3 - Room 115, Spanish - Room 108, Study Hall 1 - Room 108, Computer Science - Room 216, Psychology - Room 120, Study Hall 3 - Room 122",
    "Tuesday B": "Study Hall 1 - Room 108, Spanish - Room 108, Psychology - Room 120, Computer Science - Room 216, Flex Events, Study Hall 3 - Room 109",
    "Wednesday B": "Psychology - Room 120, TOK - Room 109, Computer Science - Room 216, Study Hall 3 - Room 117, Spanish - Room 108, Study Hall 1 - Room 108",
    "Thursday B": "Psychology - Room 120, Study Hall 1 - Room 208, TOK - Room 109, Spanish - Room 108, Study Hall 3 - Room 117",
    "Friday B": "Study Hall 1 - Room 225, Computer Science - Room 216, Spanish - Room 108, PHE, Computer Science - Room 216, Psychology - Room 120"
};

const startDate = new Date("2025-04-11");

function getTodayDate() {
    return new Date();
}

function getWeekAndDay() {
    const today = getTodayDate();
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

    const isWeekA = Math.floor(daysSinceStart / 7) % 2 === 0;
    const week = isWeekA ? "A" : "B";

    const dayIndex = today.getDay();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const dayOfWeek = daysOfWeek[dayIndex];
    const ttDay = `${dayOfWeek} ${week}`;

    return { week, dayOfWeek: ttDay };
}

function getTodayTT() {
    const { dayOfWeek } = getWeekAndDay();
    return timetable[dayOfWeek] ? timetable[dayOfWeek].split(", ") : ["No School Today!!!"];
}

function displaySchedule() {
    const schedule = document.getElementById("scheduleList");
    const weekInfo = document.getElementById("weekInfo");

    schedule.innerHTML = "";

    const { week, dayOfWeek } = getWeekAndDay();
    weekInfo.textContent = `Today is ${dayOfWeek} (Week ${week})`;

    const events = getTodayTT();
    events.forEach(event => {
        const listItem = document.createElement("li");
        listItem.textContent = event;
        schedule.appendChild(listItem);
    });
}

document.addEventListener("DOMContentLoaded", displaySchedule);

function greeting() {
    const now = getTodayDate();
    const hours = now.getHours();
    const greeting = document.getElementById("greeting");

    greeting.innerHTML = "";

    if (hours < 12 & hours >= 4) {
        greeting.textContent = "Good Morning Arhan!"
    } else if (hours >= 12 & hours < 16) {
        greeting.textContent = "Good Afternoon Arhan!"
    } else if (hours >= 16 & hours < 20) {
        greeting.textContent = "Good Evening Arhan!"
    } else if (hours >= 20 || hours < 4) {
        greeting.textContent = "Good Night Arhan!"
    }
}

document.addEventListener("DOMContentLoaded", greeting);
