
module.exports = (app) => {
    const Department = require("../controllers/department.controller.js");

    app.post("/createdepartment", Department.createDepartment);






    app.get("/get-all/:order", Department.findAll);


};