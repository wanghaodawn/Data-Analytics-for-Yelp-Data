const mysql = require('mysql');

const SUCCESS = 'SUCCESS';
const FAIL = 'FAIL';
const NO_RESULTS = 'NO_RESULTS';
const MISSING_BUSINESS_ID = 'MISSING_BUSINESS_ID';
const MISSING_USER_ID = 'MISSING_USER_ID';

module.exports = {
    recommendation : function (connection, req, res, callback) {
        // Get all queries from request
        data = req.body;
        console.log(data);
        for (var attribute in data) {
            value = data[attribute]
        }

        var queryStart  = "SELECT b.* FROM businesses b, attributes a \
                           WHERE b.latitude >= 40 AND b.latitude <= 41 AND \
                                 b.longitude >= -81 AND b.longitude <= -79 AND \
                                 b.business_id = a.business_id ";
        var queryEnd    = " ORDER BY b.stars DESC, b.review_count DESC;"
        var queryString = queryStart;
        if (Object.keys(data).length == 0) {
            // If no conditions are selected
            console.log(111);
        } else {
            // If some conditions are selected
            console.log(222);
            var condition = "";
            if (data['Alcohol']) {
                console.log(!data['Alcohol'] instanceof Array);
                if ((data['Alcohol'] instanceof Array) == false) {
                    queryString += ` AND (a.attribute = 'Alcohol' AND a.value = '${data['Alcohol']}\n') `;
                } else if (data['Alcohol'].length == 2) {
                    queryString += ` AND (a.attribute = 'Alcohol' AND (a.value = '${data['Alcohol'][0]}\n' OR a.value = '${data['Alcohol'][1]}\n')) `;
                } else if (data['Alcohol'].length == 3) {
                    queryString += ` AND (a.attribute = 'Alcohol' AND (a.value = '${data['Alcohol'][0]}\n' OR a.value = '${data['Alcohol'][1]}\n' OR a.value = '${data['Alcohol'][2]}\n')) `;
                }
            }
            if (data['NoiseLevel']) {
                if ((data['NoiseLevel'] instanceof Array) == false) {
                    queryString += ` AND (a.attribute = 'NoiseLevel' AND a.value = '${data['NoiseLevel']}\n') `;
                } else if (data['NoiseLevel'] == 2) {
                    queryString += ` AND (a.attribute = 'NoiseLevel' AND (a.value = '${data['NoiseLevel'][0]}\n' OR a.value = '${data['NoiseLevel'][1]}\n')) `;
                } else if (data['NoiseLevel'] == 3) {
                    queryString += ` AND (a.attribute = 'NoiseLevel' AND (a.value = '${data['NoiseLevel'][0]}\n' OR a.value = '${data['NoiseLevel'][1]}\n' OR a.value = '${data['NoiseLevel'][2]}\n')) `;
                } else if (data['NoiseLevel'] == 4) {
                    queryString += ` AND (a.attribute = 'NoiseLevel' AND (a.value = '${data['NoiseLevel'][0]}\n' OR a.value = '${data['NoiseLevel'][1]}'\n OR a.value = '${data['NoiseLevel'][2]}\n' OR a.value = '${data['NoiseLevel'][3]}\n')) `;
                }
            }
            if (data['RestaurantsAttire']) {
                if ((data['RestaurantsAttire'] instanceof Array) == false) {
                    queryString += ` AND (a.attribute = 'RestaurantsAttire' AND a.value = '${data['RestaurantsAttire']}\n') `;
                } else if (data['NoiseLevel'] == 2) {
                    queryString += ` AND (a.attribute = 'RestaurantsAttire' AND (a.value = '${data['RestaurantsAttire'][0]}\n' OR a.value = '${data['RestaurantsAttire'][1]}\n')) `;
                } else if (data['NoiseLevel'] == 3) {
                    queryString += ` AND (a.attribute = 'RestaurantsAttire' AND (a.value = '${data['RestaurantsAttire'][0]}\n' OR a.value = '${data['RestaurantsAttire'][1]}\n' OR a.value = '${data['RestaurantsAttire'][2]}\n')) `;
                } else if (data['NoiseLevel'] == 4) {
                    queryString += ` AND (a.attribute = 'RestaurantsAttire' AND (a.value = '${data['RestaurantsAttire'][0]}\n' OR a.value = '${data['RestaurantsAttire'][1]}'\n OR a.value = '${data['RestaurantsAttire'][2]}\n' OR a.value = '${data['RestaurantsAttire'][3]}\n')) `;
                }
            }
            if (data['RestaurantsPriceRange2']) {
                console.log(!data['RestaurantsPriceRange2'] instanceof Array);
                if ((data['RestaurantsPriceRange2'] instanceof Array) == false) {
                    queryString += ` AND (a.attribute = 'RestaurantsPriceRange2' AND a.value = '${data['RestaurantsPriceRange2']}\n') `;
                } else if (data['Alcohol'].length == 2) {
                    queryString += ` AND (a.attribute = 'RestaurantsPriceRange2' AND (a.value = '${data['RestaurantsPriceRange2'][0]}\n' OR a.value = '${data['RestaurantsPriceRange2'][1]}\n')) `;
                } else if (data['Alcohol'].length == 3) {
                    queryString += ` AND (a.attribute = 'RestaurantsPriceRange2' AND (a.value = '${data['RestaurantsPriceRange2'][0]}\n' OR a.value = '${data['RestaurantsPriceRange2'][1]}\n' OR a.value = '${data['RestaurantsPriceRange2'][2]}\n')) `;
                } else if (data['Alcohol'].length == 4) {
                    queryString += ` AND (a.attribute = 'RestaurantsPriceRange2' AND (a.value = '${data['RestaurantsPriceRange2'][0]}\n' OR a.value = '${data['RestaurantsPriceRange2'][1]}\n' OR a.value = '${data['RestaurantsPriceRange2'][2]}\n OR a.value = '${data['RestaurantsPriceRange2'][3]}\n')) `;
                }
            }
            for (attribute in data) {
                if (attribute == 'Alcohol' || attribute == 'NoiseLevel' || attribute == 'RestaurantsPriceRange2' || attribute == 'RestaurantsAttire') {
                    continue;
                }
                value = data[attribute];
                queryString += ` AND a.attribute = '${attribute}' AND a.value = '${value}\n' `
            }
        }
        queryString += queryEnd;
        console.log(queryString.replace('\n', ' '));
        connection.query(queryString, function(err, rows) {
            if (err) {
                // Fail
                console.log(err);
                return callback({message: FAIL, restaurants:  null});
            }
            // Success
            var result = [];
            if (rows.length == 0) {
                return callback({message: NO_RESULTS, restaurants: result});
            }
            var dic = {};
            for (var i = 0; i < rows.length && result.length <= 20; i++) {
                if (rows[i].business_id in dic) {
                    continue;
                }
                var row = {
                    business_id: rows[i].business_id,
                    name: rows[i].name,
                    address: rows[i].address,
                    city: rows[i].city,
                    state: rows[i].state,
                    latitude: rows[i].latitude,
                    longitude: rows[i].longitude,
                    stars: rows[i].stars,
                    review_count: rows[i].review_count,
                    type: rows[i].type,
                    neighborhood: rows[i].neighborhood
                }
                // console.log(rows)
                dic[row.business_id] = 1;
                // console.log(dic);
                result.push(row);
                // console.log(result);
            }
            // console.log(result);
            return callback({message: SUCCESS, restaurants: result});
        });
    },



    getReviewByBusinessId : function (connection, req, res, callback) {
        // Get all queries from request
        data = req.query;
        if (!'business_id' in data) {
            return callback({message: MISSING_BUSINESS_ID, reviews:  null});
        }
        console.log(data);
        var queryString =  "SELECT r.review_id, r.user_id, r.business_id, r.stars, r.date, r.text, r.num_useful, r.num_funny, r.num_cool, b.name \
                            FROM reviews r, businesses b WHERE r.business_id = ? AND b.business_id = r.business_id \
                            ORDER BY r.num_useful DESC, r.num_funny DESC, r.num_cool DESC, r.date DESC;";
        connection.query(queryString, data.business_id, function(err, rows) {
            if (err) {
                // Fail
                console.log(err);
                return callback({message: FAIL, reviews:  null});
            }
            var dic = {};
            var result = [];
            for (var i = 0; i < rows.length && result.length <= 20; i++) {
                var row = {
                    review_id: rows[i].review_id,
                    user_id: rows[i].user_id,
                    business_id: rows[i].business_id,
                    stars: rows[i].stars,
                    date: rows[i].date,
                    text: rows[i].text,
                    num_useful: rows[i].num_useful,
                    num_funny: rows[i].num_funny,
                    num_cool: rows[i].num_cool,
                    name: rows[i].name
                }
                // console.log(dic);
                result.push(row);
                // console.log(result);
            }
            return callback({message: SUCCESS, reviews: result});
        });
    },



    getReviewByUserId : function (connection, req, res, callback) {
        // Get all queries from request
        data = req.query;
        if (!'user_id' in data) {
            return callback({message: MISSING_BUSINESS_ID, reviews:  null});
        }
        console.log(data);
        var queryString =  "SELECT r.review_id, r.user_id, r.business_id, r.stars, r.date, r.text, r.num_useful, r.num_funny, r.num_cool, b.name \
                            FROM reviews r, businesses b WHERE r.user_id = ? AND b.business_id = r.business_id \
                            ORDER BY r.num_useful DESC, r.num_funny DESC, r.num_cool DESC, r.date DESC;";
        connection.query(queryString, data.user_id, function(err, rows) {
            if (err) {
                // Fail
                console.log(err);
                return callback({message: FAIL, reviews:  null});
            }
            var dic = {};
            var result = [];
            for (var i = 0; i < rows.length && result.length <= 20; i++) {
                var row = {
                    review_id: rows[i].review_id,
                    user_id: rows[i].user_id,
                    business_id: rows[i].business_id,
                    stars: rows[i].stars,
                    date: rows[i].date,
                    text: rows[i].text,
                    num_useful: rows[i].num_useful,
                    num_funny: rows[i].num_funny,
                    num_cool: rows[i].num_cool,
                    name: rows[i].name
                }
                // console.log(dic);
                result.push(row);
                // console.log(result);
            }
            return callback({message: SUCCESS, reviews: result});
        });
    }
}
