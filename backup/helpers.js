// helpers.js

const createArray = (count) => Array.from(new Array(count));

export const handlebarsHelpers = {

    stars: (rating) => {
        const num = Math.round(rating);
        return createArray(num);
    },

    emptyStars: (rating) => {
        const num = 5 - Math.round(rating);
        return createArray(num);
    },

    toFixed: (number, precision) => {
        return Number(number).toFixed(precision);
    },
 
    join: (array, separator) => {
        if (Array.isArray(array)) {
            return array.join(separator);
        }
        return array;
    },

    eq: (v1, v2) => {
        return v1 === v2;
    }
};
