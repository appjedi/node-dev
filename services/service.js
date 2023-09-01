const MyDAO = require("../dao/MyDAO.js");


module.exports =
class MainService {
    constructor(connObj)
    {
        console.log("connObj", connObj);
        this.dao = new MyDAO(connObj);
    }

    getVideos = async () => {
        const results = await this.dao.query("SELECT * FROM view_videos ORDER BY id DESC LIMIT 50");
     //   console.log("getVideos", results);
        return results;
    }
    saveVideo = async ($data) => {
        console.log("console", $data);
        //  usp_video_save (0,'test.com', '2023-08-01','TITLE','source',1,1,1,1,1,1)
        const sp = "call usp_video_save (?,?,?,?,?,?,?,?,?,?,?)"; 
        const values = [$data['id'], $data['url'], $data['videoDate'], $data['title'],"src", $data['sortOrder'], $data['hostedBy'], $data['sectionId'], $data['eventId'],$data['status'],1];
        console.log("values",values);
        const result = this.dao.execute(sp, values);
        console.log("result", result);
        return result;
    }
    query = async (query, values)=>{
        const result = await this.dao.query(query,values);
        console.log ("result",result)
        return result;
    }   
}