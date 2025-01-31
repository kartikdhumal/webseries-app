export default class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "Not Found Error";
        this.statusCode = 404;
    }
}


function getSum(...res) {
    let sum = 0;
    if (res.length === 0) throw new NotFoundError("Please Add Input");
    else {
        sum = res.reduce((acc, curr) => acc + curr);
    }
    return sum;
}

console.log(getSum(10, 20));