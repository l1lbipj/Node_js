const { successResponse } = require('../utils/apiResponse');

const getAllBooks = async (req, res, next) => {
    try{
        successResponse(res, 'Get all books successfully', []);
    }catch(error){
        next(error);
    }
}
const getBookById = async (req, res, next) => {
    try {
        const {id} = req.params;
        successResponse(res, `Get book with ID ${id} successfully`, { id });
    }catch(error){
        next(error);
    }
}
const createBook = async (req, res, next) => {
    try{
        successResponse(res, 'Create book successfully', req.body, 201);
    }catch(error){
        next(error);
    }
}
const updateBook = async (req, res, next) => {
    try{
        const {id} = req.params;
        successResponse(res, `Book with ID ${id} updated successfully`, {...req.body, id});
    }catch(error){
        next(error);
    }
}
const deleteBook = async (req, res, next) => {
    try{
        const {id} = req.params;
        successResponse(res, `Book with ID ${id} deleted successfully`, {id});
    }catch(error){
        next(error);
    }
}
module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };