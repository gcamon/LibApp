'use strict';

var mongoose = require('mongoose');

var model = function (){

	var Schema = mongoose.Schema;

	var personSchema = Schema({
	  firstname: String,
	  lastname: String,
	  username: String,
	  password: String,
	  email: String,
	  phone: String,
	  address: String
	},{
	  collection: "userInfo"
	});

	var bookSchema = Schema({
	  book_id: String,
	  book_title: String,
	  category: String,
	  collector_firstname: String,
	  collector_lastname: String,
	  collector_address: String,
	  collector_phone: String,
	  status: String,
	  date_of_collection: String,
	  surcharge: Number,
	  quantity: Number,
	  multiple: Array,
	  check: Boolean
	},{
	  collection: "bookInfo"
	});

	var models = {};

	//model
	models.newUser = mongoose.model('userInfo', personSchema);
	models.newBook = mongoose.model('bookInfo',bookSchema);

	return models;

}

module.exports = model;