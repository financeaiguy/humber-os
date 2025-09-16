export class ProjectAssignmentService {
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 3959;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    estimateTravelTime(distance) {
        if (distance <= 50)
            return Math.round(distance * 1.5);
        if (distance <= 300)
            return Math.round(distance * 1.2 + 60);
        if (distance <= 1000)
            return Math.round(120 + (distance / 500) * 60);
        return Math.round(180 + (distance / 1000) * 120);
    }
    calculateSkillMatch(engineerSkills, projectSkills) {
        if (projectSkills.length === 0)
            return 0.7;
        const matchingSkills = engineerSkills.filter(skill => projectSkills.some(projSkill => skill.toLowerCase().includes(projSkill.toLowerCase()) ||
            projSkill.toLowerCase().includes(skill.toLowerCase())));
        return Math.min(1.0, matchingSkills.length / projectSkills.length);
    }
    calculateMatchScore(engineer, project, distance, travelTime) {
        const reasons = [];
        let score = 0;
        let locationScore = 0;
        if (distance <= engineer.travelPreferences.maxTravelDistance) {
            locationScore = Math.max(0, 1 - (distance / engineer.travelPreferences.maxTravelDistance));
            reasons.push(`Within preferred travel distance (${Math.round(distance)} miles)`);
        }
        else {
            locationScore = 0;
            reasons.push(`Exceeds travel preference (${Math.round(distance)} > ${engineer.travelPreferences.maxTravelDistance} miles)`);
        }
        let authScore = 0;
        if (engineer.workAuthorization.countries.includes(project.workCountry)) {
            authScore = 1;
            reasons.push(`Authorized to work in ${project.workCountry}`);
        }
        else {
            authScore = 0;
            reasons.push(`Not authorized to work in ${project.workCountry}`);
        }
        const skillMatch = this.calculateSkillMatch(engineer.skills, project.skills || []);
        if (skillMatch > 0.7) {
            reasons.push(`Strong skill match (${Math.round(skillMatch * 100)}%)`);
        }
        else if (skillMatch > 0.4) {
            reasons.push(`Moderate skill match (${Math.round(skillMatch * 100)}%)`);
        }
        else {
            reasons.push(`Limited skill match (${Math.round(skillMatch * 100)}%)`);
        }
        let experienceScore = 0;
        if (engineer.experience >= (project.preferredExperience || 5)) {
            experienceScore = Math.min(1, engineer.experience / 15);
            reasons.push(`Meets experience requirements (${engineer.experience} years)`);
        }
        else {
            experienceScore = engineer.experience / (project.preferredExperience || 5);
            reasons.push(`Below preferred experience level`);
        }
        const ratingScore = engineer.rating / 5;
        if (engineer.rating >= 4.5) {
            reasons.push(`Excellent performance rating (${engineer.rating}/5)`);
        }
        let availabilityScore = 0;
        if (engineer.availability === 'Available') {
            availabilityScore = 1;
            reasons.push('Currently available');
        }
        else if (engineer.availability === 'Available Soon') {
            availabilityScore = 0.8;
            reasons.push('Available soon');
        }
        else {
            availabilityScore = 0.2;
            reasons.push('Limited availability');
        }
        score = (locationScore * 0.25 +
            authScore * 0.25 +
            skillMatch * 0.20 +
            experienceScore * 0.15 +
            ratingScore * 0.10 +
            availabilityScore * 0.05) * 100;
        if (project.urgency === 'Critical' && engineer.availability === 'Available') {
            score += 10;
            reasons.push('Urgency bonus for immediate availability');
        }
        return { score: Math.round(score), reasons };
    }
    findSuitableEngineers(project, availableEngineers, requiredCategory) {
        const results = [];
        const projectCoordinates = project.coordinates || this.getLocationCoordinates(project.location);
        for (const engineer of availableEngineers) {
            if (requiredCategory && engineer.category !== requiredCategory) {
                continue;
            }
            const distance = this.calculateDistance(engineer.coordinates.lat, engineer.coordinates.lng, projectCoordinates.lat, projectCoordinates.lng);
            const travelTime = this.estimateTravelTime(distance);
            const { score, reasons } = this.calculateMatchScore(engineer, project, distance, travelTime);
            results.push({
                engineer,
                distance: Math.round(distance),
                travelTime,
                matchScore: score,
                matchReasons: reasons
            });
        }
        return results.sort((a, b) => b.matchScore - a.matchScore);
    }
    generateAssignmentRecommendations(engineer, availableProjects) {
        const suitableProjects = [];
        for (const project of availableProjects) {
            const projectCoordinates = project.coordinates || this.getLocationCoordinates(project.location);
            const distance = this.calculateDistance(engineer.coordinates.lat, engineer.coordinates.lng, projectCoordinates.lat, projectCoordinates.lng);
            const travelTime = this.estimateTravelTime(distance);
            const categoryNeeded = project.engineersNeeded[engineer.category] > 0;
            if (!categoryNeeded)
                continue;
            const { score, reasons } = this.calculateMatchScore(engineer, project, distance, travelTime);
            if (score >= 30) {
                suitableProjects.push({
                    projectId: project.id,
                    clientName: project.client,
                    projectName: project.name,
                    location: project.location,
                    distance: Math.round(distance),
                    travelTime,
                    matchScore: score,
                    matchReasons: reasons,
                    estimatedStartDate: project.startDate,
                    estimatedEndDate: project.endDate,
                    hourlyRate: engineer.hourlyRate
                });
            }
        }
        return {
            engineerId: engineer.id,
            suitableProjects: suitableProjects.sort((a, b) => b.matchScore - a.matchScore),
            generatedAt: Date.now()
        };
    }
    getLocationCoordinates(location) {
        const locationMap = {
            'Austin, TX': { lat: 30.2672, lng: -97.7431 },
            'Detroit, MI': { lat: 42.3314, lng: -83.0458 },
            'San Jose, CA': { lat: 37.3382, lng: -121.8863 },
            'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
            'Dearborn, MI': { lat: 42.3223, lng: -83.1763 },
            'Warren, OH': { lat: 41.2376, lng: -80.8184 },
            'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
            'Houston, TX': { lat: 29.7604, lng: -95.3698 },
            'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
            'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
            'New York, NY': { lat: 40.7128, lng: -74.0060 },
            'Atlanta, GA': { lat: 33.7490, lng: -84.3880 }
        };
        return locationMap[location] || { lat: 39.8283, lng: -98.5795 };
    }
    calculateOptimalTeam(project, availableEngineers) {
        const recommendations = [];
        let totalEstimatedCost = 0;
        let totalTravelTime = 0;
        let engineerCount = 0;
        for (const [category, needed] of Object.entries(project.engineersNeeded)) {
            if (needed > 0) {
                const categoryEngineers = this.findSuitableEngineers(project, availableEngineers, category);
                const candidates = categoryEngineers.slice(0, needed * 2);
                recommendations.push({
                    category: category,
                    needed,
                    candidates: candidates.map(c => ({
                        engineer: c.engineer,
                        matchScore: c.matchScore,
                        distance: c.distance,
                        travelTime: c.travelTime
                    }))
                });
                const topCandidates = candidates.slice(0, needed);
                for (const candidate of topCandidates) {
                    const projectDuration = this.calculateProjectDuration(project.startDate, project.endDate);
                    const weeklyCost = candidate.engineer.hourlyRate * 40;
                    totalEstimatedCost += weeklyCost * projectDuration;
                    totalTravelTime += candidate.travelTime;
                    engineerCount++;
                }
            }
        }
        return {
            recommendations,
            totalEstimatedCost: Math.round(totalEstimatedCost),
            averageTravelTime: engineerCount > 0 ? Math.round(totalTravelTime / engineerCount) : 0
        };
    }
    calculateProjectDuration(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        return diffWeeks;
    }
}
export const projectAssignmentService = new ProjectAssignmentService();
//# sourceMappingURL=project-assignment-service.js.map