const db = require("../fw/db")

async function compareUserAndTaskID(taskID, userID) {
    let dbConnection;
    try {
        dbConnection = await db.connectDB();
        const sql = "SELECT title FROM tasks WHERE ID = ? AND userID = ?";
        const [result] = await dbConnection.query(sql, [taskID, userID]);
        return result.length > 0;
    } catch (error) {
        console.error('Error comparing user and task ID:', error);
        throw error; // Propagate the error to be handled by the caller
    } finally {
        if (dbConnection) {
            dbConnection.end(); // Ensure the connection is properly closed
        }
    }
}

const deleteTask = async (taskID) => {
    let dbConnection;
    try {
        dbConnection = await db.connectDB();
        const sql = "DELETE FROM tasks WHERE ID = ?";
        await dbConnection.query(sql, [taskID]);
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.end();
        }
    }
};

async function checkLockedUser(ip){
    let dbConnection;
    try{
        
        dbConnection = await db.connectDB();
        const sql = "SELECT lock_untill FROM login_attempts WHERE userIP = ?"
        const [result] = await dbConnection.query(sql, [ip]);
        const timestamp = new Date().toISOString();
        const timestampValue = new Date(timestamp).getTime();

        if(!result.length > 0){
            return false
        }

        if (parseInt(result[0].lock_untill) >= timestampValue){
            return true
        }
        return false
    } catch (error){
        console.error("Error checking locked users:", error);
        return false;
    } finally{
        if (dbConnection){
            dbConnection.end
        }
    }
}

async function lockUser(ip){
    let dbConnection;
    try{
        dbConnection = await db.connectDB();
        const sql = `INSERT INTO login_attempts (userIP, lock_untill)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
        lock_untill = VALUES(lock_untill);`
        const timestamp = new Date();
        timestamp.setMinutes(timestamp.getMinutes() + 5);
        const timestampValue = new Date(timestamp).getTime();
        const values = [ip, timestampValue]
        await dbConnection.query(sql, values)
    } catch (error){
        console.error("Error locking users:", error);
        return false;
    } finally{
        if (dbConnection){
            dbConnection.end
        }
    }
}

async function checkUserPermissions(userId) {
    let dbConnection;

    try {
        // Validate userId
        if (!Number.isInteger(Number(userId))) {
            console.log(userId);
            return false;
        }

        // Connect to the database
        dbConnection = await db.connectDB();

        // Query to get role title using a JOIN
        const sql = `
            SELECT r.title
            FROM permissions p
            JOIN roles r ON p.roleID = r.ID
            WHERE p.userID = ?
        `;
        const [result] = await dbConnection.query(sql, [userId]);

        if (result.length === 0) {
            return false;
        }

        // Return the role title
        return result[0].title;
    } catch (error) {
        console.error("Error checking user permissions:", error);
        return false;
    } finally {
        if (dbConnection) {
            // Ensure the database connection is closed
            dbConnection.end();
        }
    }
}

module.exports = {
    deleteTask,
    checkLockedUser,
    checkUserPermissions,
    compareUserAndTaskID,
    lockUser
}