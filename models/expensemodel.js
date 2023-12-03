

const mongoose = require('mongoose');
// const plm = require('passport-local-mongoose');

const expenseModel = new mongoose.Schema(
    {
        category:String,
        description:String,
        amount:Number,
        paymentmodes:String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "collection" },
    },
    { timestamps: true },
);
// expenseModel.plugin(plm);



module.exports = mongoose.model('expense',expenseModel);


