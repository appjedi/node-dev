const sqlite3= require('sqlite3');
const open= require('sqlite');
module.exports= class Dictionary   {
     
        constructor(){
          
            
         }
     
    getConn (){
        return new sqlite3.Database("./AutoComplete.db");
    }
    query = async (word, limit)=>{
        var sql = "SELECT * FROM dictionary WHERE word LIKE '"+word+"%' LIMIT "+limit;
        console.log(sql);
        const db = this.getConn();
        //const rows = await db.all(sql);
        let wordsFound=[];
        await (async () => {
            // open the database
            db.all(sql, [], (err, rows) => {
                if (err) {
                  throw err;
                }
                console.log ("got", rows);
                for (let i in rows)
            {
                wordsFound.push (rows[i].word);
            }
            console.log ("returning", rows);
            return wordsFound;
              });
        })();
    }
    async seed (words)
    {
        const insert ="INSERT INTO dictionary (word)VALUES (?)";
        const db = this.getConn()
        for (let i in words)
        {
            await db.run(`INSERT INTO dictionary(word) VALUES(?)`, [words[i]]);
        }
    }
    async add(word)
    {
        const db = this.getConn();
        const insert ="INSERT INTO dictionary (word)VALUES (?)";
        await db.run(`INSERT INTO dictionary(word) VALUES(?)`, word);
    }
}
