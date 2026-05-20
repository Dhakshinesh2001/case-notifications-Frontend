import { db } from "@/db/database";
import { Alert } from "react-native";

export const orgRepository = {
//     createLocal: (data: any) => {
//         // console.log(db.getAllSync(`SELECT * FROM orgs WHERE deletedAt IS NULL`));
//         // Alert.alert("inside org repo db");
//         db.runSync(
//             `INSERT INTO orgs
//       (id, name, role, createdAt, updatedAt, deletedAt, isCurrentOrg) 
//       VALUES (?, ?, ?, ?, ?, ?, ?)`,
//             [
//                 data.id,
//                 data.name,
//                 data.role || 'ADMIN',
//                 data.createdAt,
//                 data.updatedAt,
//                 data.deletedAt || '',
//                 0, // New orgs start as inactive by default
//             ]
//         );
//     },

//     getOrgs: (): any[] => {
//         return db.getAllSync(`SELECT * FROM orgs WHERE deletedAt IS NULL`);
//     },

    getOrgById: (id: string): any[] => {
        return db.getAllSync(`SELECT * FROM orgs WHERE id = ?`, [id]);
    },

    changeOrg: (org: any) => {
        console.log(
  'CHANGE ORG INPUT:',
  org
);
        if(orgRepository.getOrgById(org.id).length < 1){
                orgRepository.saveOrg(org);
        }
        // Wrap in transaction for safety
        db.withTransactionSync(() => {
            // 1. Reset all to 0
            db.runSync(`UPDATE orgs SET isCurrentOrg = 0`);
            // 2. Set target to 1
            db.runSync(`UPDATE orgs SET isCurrentOrg = 1 WHERE id = ?`, [org.id]);
        });
    },

    currentOrg: (): any | null => {
        // console.log("all orgs",db.getAllSync(
        //   `SELECT * FROM orgs`
        // ));
        const results = db.getAllSync(
            `SELECT * FROM orgs WHERE isCurrentOrg = 1 LIMIT 1`
        );
        return results.length > 0 ? results[0] : null;
    },

//     upsertFromBackend: (data: any): any | null => {
//         const local = orgRepository.getOrgById(data.id);
//         const now = new Date().toISOString();
//         console.log("local:", local);
//         console.log("all orgs:",orgRepository.getOrgs());
//         if(data.deletedAt == null)data.deletedAt = '';
//         if (!local.length) {
//             console.log("inside !local");
//             db.runSync(
//                 `INSERT INTO orgs
//       (id, name, role, createdAt, updatedAt, deletedAt, isCurrentOrg) 
//       VALUES (?, ?, ?, ?, ?, ?, ?)`,
//                 [
//                     data.id,
//                     data.name,
//                     data.role || 'JUNIOR',
//                     data.createdAt,
//                     data.updatedAt ?? now,
//                     data.deletedAt || '',
//                     0, // New orgs start as inactive by default
//                 ]
//             );
//         }

//         if (!data.deletedAt) {
//             db.runSync(`UPDATE orgs SET deletedAt = ?`, data.deletedAt);
//         }

//         return;
//     },
//   saveOrg: (data: any) => {
//     db.runSync(`DELETE FROM orgs`); // 🔥 only one org allowed

//     db.runSync(
//       `INSERT INTO orgs
//       (id, name, role, createdAt, updatedAt, deletedAt) 
//       VALUES (?, ?, ?, ?, ?, ?)`,
//       [
//         data.id,
//         data.name,
//         data.role || 'ADMIN',
//         data.createdAt,
//         data.updatedAt,
//         data.deletedAt || '',
//       ]
//     );
//   },

  getOrg: (): any | null => {
    const results = db.getAllSync(
      `SELECT * FROM orgs LIMIT 1`
    );

    return results.length ? results[0] : null;
  },
  

  clearOrg: () => {
    db.runSync(`DELETE FROM orgs`);
  },

  saveOrg: (data: any) => {
        db.runSync(
            `INSERT OR REPLACE INTO orgs
      (id, name, role, createdAt, updatedAt, deletedAt, isCurrentOrg) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                data.id,
                data.name,
                data.role,
                data.createdAt,
                data.updatedAt || '',
                data.deletedAt || '',
                0, // New orgs start as inactive by default
            ]
        );
    },




};