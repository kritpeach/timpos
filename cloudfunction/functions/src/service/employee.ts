import * as admin from 'firebase-admin';

interface Employee {
    createAt?: Date
    name?: string
    password?: string
    restaurant?: FirebaseFirestore.DocumentReference
    role?: "staff" | "manager"
}
interface employeeTokenPayload {
    success: boolean
    token: string
    restaurantNameDoesNotExist: boolean
    employeeDoesNotExist: boolean
}
const errorName = {
    restaurantNameDoesNotExist: 'restaurantNameDoesNotExist',
    employeeDoesNotExist: 'employeeDoesNotExist'
}
const getEmployeeToken = async (restaurantName: string, employeePassword: string): Promise<employeeTokenPayload> => {
    const db = admin.firestore();
    try {
        const restaurantQueryResult = await db.collection('restaurant').where('name', '==', restaurantName).limit(1).get();
        if (restaurantQueryResult.empty) return { success: false, token: null, restaurantNameDoesNotExist: true, employeeDoesNotExist: null };
        const restaurantId = restaurantQueryResult.docs[0].id;
        const restaurantRef = db.collection('restaurant').doc(restaurantId);
        const employeeQueryResult = await db.collection('employee')
            .where('restaurant', '==', restaurantRef)
            .where('password', '==', employeePassword)
            .limit(1)
            .get();
        if (employeeQueryResult.empty) return { success: false, token: null, restaurantNameDoesNotExist: false, employeeDoesNotExist: true };
        const employee: Employee = employeeQueryResult.docs[0].data();
        const uid = restaurantId + employeePassword;
        const token = await admin.auth().createCustomToken(uid, {
            restaurantId,
            role: employee.role
        });
        return { success: true, token, restaurantNameDoesNotExist: false, employeeDoesNotExist: false };
    } catch (e) {
        console.log(e);
        return { success: false, token: null, restaurantNameDoesNotExist: null, employeeDoesNotExist: null };
    }

}

export default { getEmployeeToken, errorName };