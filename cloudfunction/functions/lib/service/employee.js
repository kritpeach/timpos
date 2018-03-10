"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const errorName = {
    restaurantNameDoesNotExist: 'restaurantNameDoesNotExist',
    employeeDoesNotExist: 'employeeDoesNotExist'
};
const getEmployeeToken = (restaurantName, employeePassword) => __awaiter(this, void 0, void 0, function* () {
    const db = admin.firestore();
    try {
        const restaurantQueryResult = yield db.collection('restaurant').where('name', '==', restaurantName).limit(1).get();
        if (restaurantQueryResult.empty)
            return { success: false, token: null, restaurantNameDoesNotExist: true, employeeDoesNotExist: null };
        const restaurantId = restaurantQueryResult.docs[0].id;
        const restaurantRef = db.collection('restaurant').doc(restaurantId);
        const employeeQueryResult = yield db.collection('employee')
            .where('restaurant', '==', restaurantRef)
            .where('password', '==', employeePassword)
            .limit(1)
            .get();
        if (employeeQueryResult.empty)
            return { success: false, token: null, restaurantNameDoesNotExist: false, employeeDoesNotExist: true };
        const employee = employeeQueryResult.docs[0].data();
        const uid = restaurantId + employeePassword;
        const token = yield admin.auth().createCustomToken(uid, {
            restaurantId,
            role: employee.role
        });
        return { success: true, token, restaurantNameDoesNotExist: false, employeeDoesNotExist: false };
    }
    catch (e) {
        console.log(e);
        return { success: false, token: null, restaurantNameDoesNotExist: null, employeeDoesNotExist: null };
    }
});
exports.default = { getEmployeeToken, errorName };
//# sourceMappingURL=employee.js.map