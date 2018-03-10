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
const create = (user, restaurantName) => __awaiter(this, void 0, void 0, function* () {
    //Must signin
    if (user === null)
        return { authorization: false, success: false, duplicate: null };
    return admin.firestore().runTransaction((tx) => __awaiter(this, void 0, void 0, function* () {
        //Restaurant name must be unique
        const duplicateRestaurant = yield tx.get(admin.firestore().collection('restaurant').where('name', '==', restaurantName).limit(1)).catch(e => {
            console.log(e);
            return null;
        });
        if (duplicateRestaurant.size > 0) {
            return { authorization: true, success: false, duplicate: true };
        }
        //Create restaurant with admin
        const newRestaurant = {
            name: restaurantName,
            admin: {
                [user.uid]: true
            }
        };
        const addResult = yield admin.firestore().collection('restaurant').add(newRestaurant).catch(e => null);
        if (addResult)
            return { authorization: true, success: true, duplicate: false };
        return { authorization: true, success: false, duplicate: false };
    }));
});
exports.default = { create };
//# sourceMappingURL=restaurant.js.map