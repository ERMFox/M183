const db = require('../fw/db');

async function getHtml(req) {
    let html = `
    <section id="list">
        <a href="edit">Create Task</a>
        <table>
            <tr>
                <th>ID</th>
                <th>Description</th>
                <th>State</th>
                <th></th>
            </tr>
    `;

    let conn = await db.connectDB();
    const sql = 'select ID, title, state from tasks where UserID = ?'
    let [result, fields] = await conn.query(sql, req.cookies.userid);
    result.forEach(function(row) {
        html += `
            <tr>
                <td>`+row.ID+`</td>
                <td class="wide">`+row.title+`</td>
                <td>`+ucfirst(row.state)+`</td>
                <td>
                    <a href="edit?id=`+row.ID+`">edit</a> | <a href="delete?id=`+row.ID+`" onclick="return confirm('Are you sure you want to delete this item?');">delete</a>
                </td>
            </tr>`;
    });

    html += `
        </table>
    </section>`;

    return html;
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    html: getHtml
}