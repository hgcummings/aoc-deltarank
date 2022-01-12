async function showDeltaRanks() {
    console.log("Showing delta ranks...");

    const headerRow = document.getElementsByClassName("privboard-row")[0];
    const parent = headerRow.parentElement;    const existingRows = parent.getElementsByClassName("privboard-row");
    const existingNames = [];
    for (let i = existingRows.length - 1; i > 0; --i) {
        existingNames.push(existingRows[i].getElementsByClassName("privboard-name")[0]);
        existingRows[i].remove();
    }

    const apiUrl = new URL(window.location.href);
    apiUrl.search = "";
    apiUrl.pathname += ".json";

    const response = await fetch(apiUrl);
    const data = await response.json();
    const members = Object.values(data.members);

    for (let day = 1; day <= 25; ++day) {
        const deltas = [];
        for (let member of members) {
            let stars = member.completion_day_level[day];
            if (stars && stars[1] && stars[2]) {
                deltas.push(stars[2].get_star_ts - stars[1].get_star_ts);
            }
        }
        deltas.sort((a, b) => a - b);

        for (let member of members) {
            member.points = member.points || 0;
            let stars = member.completion_day_level[day];
            if (stars && stars[1] && stars[2]) {
                member.points += (members.length - deltas.indexOf(stars[2].get_star_ts - stars[1].get_star_ts));
            }
        }
    }

    // Secondary (tie-break) sort by days the user has taken part in
    members.sort((a, b) => Object.keys(b.completion_day_level).length - Object.keys(a.completion_day_level).length);

    // Primary sort by delta points
    members.sort((a, b) => b.points - a.points);
    
    const posDigits = Math.ceil(Math.log10(members.length));
    const pointsDigits = Math.ceil(Math.log10(members[0].points));
    headerRow.firstChild.textContent = " ".repeat(posDigits + pointsDigits + 3);

    const currentDay = headerRow.getElementsByTagName("a").length;

    members.forEach((member, i) => {
        const row = document.createElement("div");
        row.classList.add("privboard-row");

        const position = document.createElement("span");
        position.classList.add("privboard-position");
        position.innerText = String(i + 1).padStart(posDigits) + ") ";

        let name = existingNames.find(elem => elem.innerText.replace(" (AoC++)", "") === member.name);

        if (!name) {
            name = document.createElement("span");
            name.classList.add("privboard-name");
            if (member.name) {
                name.innerText = member.name;            
            } else {
                name.innerText = "(anonymous user #" + member.id + ")";
            }
        }

        const stars = [];
        for (let day = 1; day <= 25; ++day) {
            let cssClass = "privboard-star-locked";
            if (day <= currentDay) {
                if (member.completion_day_level[day]) {
                    if (member.completion_day_level[day][2]) {
                        cssClass = "privboard-star-both";
                    } else {
                        cssClass = "privboard-star-firstonly";
                    }
                } else {
                    cssClass = "privboard-star-unlocked";
                }
            }
            const starElement = document.createElement("span");
            starElement.innerText = "*";
            starElement.classList.add(cssClass);
            stars.push(starElement);
        }
        
        row.append(position, String(member.points).padStart(pointsDigits) + " ", ...stars, "  ", name);

        parent.appendChild(row);
    });
}

if (window.location.href.indexOf("/leaderboard/private/view") !== -1) {
    if (window.location.search.indexOf("order=delta_score") !== -1) {
        showDeltaRanks();
    }
    const orderingInfo = document.getElementById("ordering_info");
    const orderingList = orderingInfo.getElementsByTagName("ul")[0];

    const deltaScore = document.createElement("li");
    const deltaScoreLink = document.createElement("a");
    deltaScoreLink.setAttribute("href", "?order=delta_score");
    deltaScoreLink.innerText = "[Delta score]";

    deltaScore.append(deltaScoreLink, ", which awards users on this leaderboard points based on the time difference between their first and second stars each day. Users are ranked by this time difference, then awarded points per day in a similar manner to the points per star for Local Score.");

    orderingList.prepend(deltaScore);
}
