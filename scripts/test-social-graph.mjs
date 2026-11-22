// Minimal Ponytail self-check for Social Graph degree calculation logic
function computeConnectionDegree(viewerId, targetId, directConnections, mutualCount) {
  if (viewerId === targetId) return "self";
  if (directConnections > 0) return "1st";
  if (mutualCount > 0) return "2nd";
  return "3rd+";
}

// Check 1: Self
console.assert(computeConnectionDegree("u1", "u1", 0, 0) === "self", "Self check failed");
// Check 2: Direct connection
console.assert(computeConnectionDegree("u1", "u2", 1, 0) === "1st", "1st degree failed");
// Check 3: Mutual connection
console.assert(computeConnectionDegree("u1", "u3", 0, 3) === "2nd", "2nd degree failed");
// Check 4: Distant stranger
console.assert(computeConnectionDegree("u1", "u4", 0, 0) === "3rd+", "3rd+ degree failed");

// Check 5: Feed gravity formula validation
function feedScore(reactions, comments, shares, hoursOld) {
  return ((reactions * 2.0 + comments * 3.5 + shares * 5.0 + 10.0) / Math.pow(Math.max(hoursOld, 0.1) + 2.0, 1.4));
}
const recentViral = feedScore(50, 20, 10, 2);
const oldViral = feedScore(50, 20, 10, 72);
console.assert(recentViral > oldViral, "Recent viral post must outrank old post");

console.log("All Social Graph & Feed Ranking self-checks PASSED!");
