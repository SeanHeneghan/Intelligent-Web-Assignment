const _ = require('lodash');
let Pearson = require('./PearsonCorrelation');


module.exports = class Ranking {

// Returns the best matches for person from the prefs dictionary.
// Number of results and similarity function are optional params.

    topMatches(preferences, person, n = 5) {

        let scores = [];
        let prefsWithoutPerson = _.omit(preferences, person);

        _.forIn(prefsWithoutPerson, (value, key) => {

            let score = {
                person: key
            };

            //if (similarity === 'sim_pearson')
            score.score = Pearson.sim(preferences, person, key);

            scores.push(score);

        });

        scores = _.reverse(_.sortBy(scores, 'score'));
        scores.length = n;

        return scores;

    }

// Gets recommendations for a person by using a weighted average
// of every other user's rankings

    getRecommendations(preferences, person, similarity = 'sim_pearson') {

        let totals = {};
        let simSums = {};

        // Don't compare me to myself
        let prefsWithoutPerson = _.omit(preferences, person);

        _.forIn(prefsWithoutPerson, (value, key) => {

            let sim;

            //if (similarity === 'sim_pearson')
            sim = Pearson.sim(preferences, person, key);


            // Ignore scores of zero or lower
            if (sim <= 0) return;

            _.each(preferences[key], (pref) => {

                let key = _.keys(pref)[0];
                let voted = _.some(preferences[person], key);

                if (!voted) {

                    // Similarity * Score
                    if (totals[key] === undefined) totals[key] = 0;
                    totals[key] += pref[key] * sim;

                    // Sum of similarities
                    if (simSums[key] === undefined) simSums[key] = 0;
                    simSums[key] += sim;

                } else {

                }

            });

        });

        let scores = _.map(totals, (value, key) => {
            /*return {
                story: key,
                score: value / simSums[key]
            }*/
            return key;
        });

        scores = _.reverse(_.sortBy(scores, 'score'));

        return scores;

    }
};

