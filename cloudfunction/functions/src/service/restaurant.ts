import * as admin from 'firebase-admin';

interface restaurantCreatePayload {
    success: boolean
    duplicate: boolean
    authorization: boolean
}

interface restaurant {
    name: string
    admin: object
}
const create = async (user: admin.auth.DecodedIdToken, restaurantName: string): Promise<restaurantCreatePayload> => {
    //Must signin
    if (user === null) return { authorization: false, success: false, duplicate: null }

    return admin.firestore().runTransaction(async tx => {
        //Restaurant name must be unique
        const duplicateRestaurant = await tx.get(admin.firestore().collection('restaurant').where('name', '==', restaurantName).limit(1)).catch(e => {
            console.log(e);
            return null;
        });
        if (duplicateRestaurant.size > 0) {
            return { authorization: true, success: false, duplicate: true };
        }

        //Create restaurant with admin
        const newRestaurant: restaurant = {
            name: restaurantName,
            admin: {
                [user.uid]: true
            }
        };
        const addResult = await admin.firestore().collection('restaurant').add(newRestaurant).catch(e => null);
        if (addResult) return { authorization: true, success: true, duplicate: false };
        return { authorization: true, success: false, duplicate: false };
    });
}
export default { create };