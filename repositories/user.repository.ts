import { getDB } from '../db/provider';
const db = getDB();

export const userRepository = {
    setUser: (data: {id: string, email:string, role: string, orgId: string, name: string }) => {

        const orgId = data.orgId;
        const user = db.getAllSync(`SELECT * FROM user WHERE id = ?`, [data.id]);
        if (user.length > 0) {
            db.runSync(`UPDATE user SET isCurrentUser = 0`);
            db.runSync(`UPDATE user SET isCurrentUser = 1 WHERE id = ?`, [data.id]);
        } else {
            db.runSync(
                `INSERT OR REPLACE INTO user 
          (id,name, orgId, role, email, isCurrentUser)
          VALUES (?,?, ?, ?, ?, ?)`,
                [   
                    data.id,
                    data.name  || '',
                    orgId,
                    data.role,
                    data.email,
                    1,
                ]
            );
        }
    },
    setCurrentUserOrg: (orgId: string ) => {
        
        db.runSync(
            `UPDATE user 
          SET orgId = ? WHERE isCurrentUser = 1`  ,
            [
                orgId
            ]
        );

    },
    upsertFromBackend: (users: any[], orgId: string) => {
        console.log("INSERTING ORG USERS:::::::::::::", users);
        const existingUsers: any[] = db.getAllSync(
            `SELECT id FROM orgUsers`
        );
        console.log("EU:",existingUsers);

        const incomingIds = new Set(users.map(u => u.id));

        db.execSync('BEGIN TRANSACTION');

        try {
            // INSERT OR UPDATE
            for (const user of users) {
                db.runSync(
                    `
        INSERT INTO orgUsers (
          id,
          name,
          email,
          role,
          orgId
        )
        VALUES (?, ?, ?, ?, ?)

        ON CONFLICT(id)
        DO UPDATE SET
          name = excluded.name,
          email = excluded.email,
          role = excluded.role,
          orgId = excluded.orgId
        `,
                    [
                        user.id,
                        user.name,
                        user.email,
                        user.role,
                        orgId,
                    ]
                );
            }

            // DELETE missing users
            for (const existing of existingUsers) {
                if (!incomingIds.has(existing.id)) {
                    db.runSync(
                        `DELETE FROM orgUsers WHERE id = ?`,
                        [existing.id]
                    );
                }
            }

            db.execSync('COMMIT');
        } catch (err) {
            db.execSync('ROLLBACK');
            throw err;
        }
    },

    getOrgUsers: (orgId: string) => {
        console.log("ORGID SENT:",orgId);
        const existingUsers: any[] = db.getAllSync(
            `SELECT * FROM orgUsers`
        );
        console.log("EU:",existingUsers);

        return db.getAllSync("SELECT * FROM orgUsers WHERE orgId = ?",[orgId])
    }



}