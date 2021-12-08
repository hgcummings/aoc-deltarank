async function showDeltaRanks() {
    console.log("Showing delta ranks...");

    const response = await fetch(window.location.href + ".json");
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

    members.sort((a, b) => b.points - a.points);

    const parent = document.getElementsByClassName("privboard-row")[0].parentElement;
    const description = document.createElement("p");
    description.textContent = "The following table shows the ranking by delta time between stars 1 and 2";
    parent.appendChild(description);

    const posDigits = Math.ceil(Math.log10(members.length));
    const pointsDigits = Math.ceil(Math.log10(members[0].points));

    members.forEach((member, i) => {
        const row = document.createElement("div");
        row.classList.add("privboard-row");
        row.innerHTML = `<span class="privboard-position">${String(i + 1).padStart(posDigits)}) </span>${String(member.points).padStart(pointsDigits)} <span class="privboard-name"></span>`;

        row.getElementsByClassName("privboard-name")[0].innerText = member.name;
        
        parent.appendChild(row);
    });
}

if (window.location.href.indexOf("/leaderboard/private/view") !== -1) {
    showDeltaRanks();
}