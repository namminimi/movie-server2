//express 가져오기
const express = require('express');
//cors 가져오기
const cors = require('cors');
//mysql 가져오기
const mysql = require('mysql');
// mulrer 가져오기
const multer = require('multer');
//bcrypt가져오기
const bcrypt = require('bcrypt');
//암호화 글자수
const saltRounds = 10;


//서버생성
const app = express();
//프로세서의 주소 포트번호 지정
//헤로쿠에서 지정하는게 있다면그걸쓰고 없다면 8080을써라
const port = process.env.PORT || 8080;

app.use(cors());

app.use(express.json());

// upload 폴더를 클라이언트에서 접근 가능하도록 설정
app.use('/upload', express.static('upload'));

// storage 생성
const storage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, 'upload/poster/');
    },
    filename: (req, file, cd) => {
        const newFilename = file.originalname;
        cd(null, newFilename);
    }
});
// upload 객체 생성
const upload = multer({storage: storage});
// upload 경로로 post 요청 했을 시 응답 구현 
app.post('/upload', upload.single('file'), (req, res) => {
    res.send({
        imgUrl: req.file.filename
    });
});

//mysql연결하기
const conn = mysql.createConnection({
    host: "hera-database.c6v9c00axeyk.ap-northeast-2.rds.amazonaws.com",
    user: "admin",
    password: "alstjq12$!!",
    port: "3306",
    database: "movies" 
})

//선연결
conn.connect();

// get 요청
// 최신영화 - 현재상영 페이지 데이터 전송
app.get('/latest', (req, res) => {
    conn.query('select * from movie where mov_no limit 0, 15', 
    (err, result, fields) => {
        if(result) {
            res.send(result);
        }
        console.log(err)
    });
})
// 영화 상세보기 페이지 데이터 전송
app.get('/detail/:no', (req, res) => {
    const {no} = req.params;
    conn.query(`select * from movie where mov_no=${no}`, 
    (err, result, fields) => {
        if(result) {
            res.send(result);
        }
        console.log(err)
    });
})
// 영화 상세보기 페이지 리뷰 데이터 전송
app.get('/detailreview/:no', (req, res) => {
    const {no} = req.params;
    conn.query(`select * from review where r_img = (select mov_img from movie where mov_no=${no})`, 
    (err, result, fields) => {
        if(result) {
            console.log(result)
             res.send(result);
        }
        console.log(err)
    });
})

// 최신영화 - 개봉예정 페이지 데이터 전송
app.get('/yetpos', (req, res) => {
    conn.query('select * from movie where mov_no limit 30, 15', 
    (err, result, fields) => {
        if(result) {
            res.send(result);
        }
        console.log(err)
    });
})

// 추천 영화 - 전체보기 페이지 데이터 전송
app.get('/recomend', (req, res) => {
    conn.query('select * from movie where mov_no limit 15, 15', 
    (err, result, fields) => {
        if(result) {
            res.send(result);
        }
        console.log(err)
    });
})

// 이달의 추천 영화 페이지 데이터 전송
app.get('/monthreco', (req, res) => {
    conn.query('select * from movie where mov_no limit 40, 10',
    (err, result, fields) => {
        if(result) {
            res.send(result);
        }
        console.log(err)
    });
})

//장르 영화 페이지 데이터 전송
app.get('/genrePage', (req, res) => {
    conn.query('select * from movie', 
    (err, result, fields) => {
        //console.log(result);
        if(result) {
            res.send(result);
        }
        console.log(err)
    });
})

//장르선택 페이지 데이터 전송
app.get("/genrech/:genrechange", (req, res) => {
    const {genrechange} = req.params;
    console.log(genrechange)
    if(genrechange == "전체"){
        conn.query('select * from movie', 
    (err, result, fields) => {
        //console.log(result);
        if(result) {
            res.send(result);
        }
        console.log(err)
    });
    }else{
    conn.query(`select * from movie where mov_genre like '%${genrechange}%'`, 
    (err, result, fields) => {
        //console.log(result);
        if(result) {
            console.log(result)
            res.send(result);
        }
        console.log(err)
    });
    }
})


//검색하기
app.get("/search/:name/:value", async (req, res) => {
    const {name, value} = req.params;
    console.log(value)
    conn.query(`select * from movie where ${name} like'%${value}%'`,
    (err, result, fields)=>{
        if(result){
            console.log(result)
            res.send(result)
        }
        console.log(err)
    })
})


//게시글 등록
app.post("/free", async (req, res) => {
    const {t_title, t_desc,t_nickname, t_date} = req.body;
    console.log(req)
    conn.query(`insert into board(bor_title, bor_name, bor_desc, bor_date) values('${t_title}','${t_nickname}','${t_desc}','${t_date}')`
    ,(err, result, fields)=>{
        if(result){
            console.log("성공")
            //console.log(result);
            //console.log(req.body)
            res.send(req.body);
        }
        console.log(err);
    })
})

// 게시글 상세보기 페이지 데이터 전송
app.get('/textFree/:no', (req, res) => {
    const {no} = req.params;
    conn.query(`select * from board where bor_no=${no}`, 
    (err, result, fields) => {
        if(result) {
            console.log(result)
            res.send(result);
        }
        console.log(err)
    });
})


//리뷰데이터 요청
app.get("/review", async (req, res) => {
    conn.query(`select * from review where r_no limit 0,15`, 
    (err, result, fields) => {
        if(result){
            console.log(result);
            res.send(result);
        }
    })
})

// 영화 상세보기 페이지 데이터 전송
app.get(`/reviewdetail/:post`, (req, res) => {
    const {post} = req.params;
    conn.query(`select * from movie where mov_img like '%${post}%'`, 
    (err, result, fields) => {
        if(result) {
            console.log(result)
            res.send(result);
        }
        console.log(err)
    });
})


/* ./detailreview/${list.r_img} */
//공지게시글 등록
app.post("/notices", async (req, res) => {
    const {n_title, n_desc,n_nickname, n_date} = req.body;
    console.log(req)
    conn.query(`insert into notice(not_title, not_name, not_desc, not_date) values('${n_title}','${n_nickname}','${n_desc}','${n_date}')`
    ,(err, result, fields)=>{
        if(result){
            console.log("성공")
            //console.log(result);
            //console.log(req.body)
            res.send(req.body);
        }
        console.log(err);
    })
})




//공지사항 데이터 요청
app.get("/notice", async (req, res) => {
    conn.query(`select * from notice order by not_no desc`,
    (err, result, fields)=>{
        if(result){
            res.send(result);
        }
        console.log(err)
    })
})
//공지사항 상세게시글 데이터 요청
app.get("/notice/:no", async (req, res) => {
    const { no } = req.params;
    conn.query(`select * from notice where not_no = ${no}`,
    (err, result, fields)=>{
        if(result){
            res.send(result);
        }
        console.log(err)
    })
})
//공지사항 수정
app.patch("/editNotice", async (req, res)=> {
    const {n_title, n_nickname, n_date, n_desc, n_no} = req.body
    conn.query(`update notice set not_title = '${n_title}', not_name = '${n_nickname}', not_date = '${n_date}', not_desc = '${n_desc}' where not_no = '${n_no}'`,
    (err, result, fields)=> {
        if(result) {
            res.send("등록되었습니다")
            console.log(result)
        }
        console.log(err)
    })
})

//공지사항 삭제
app.delete("/deleteNotice/:no", async (req, res)=> {
    const {no} = req.params
    conn.query(`delete from notice where not_no = '${no}'`,
    (err, result, fields)=> {
        if(result) {
            res.send("삭제되었습니다")
            console.log(result)
        }
        console.log(err)
    })
})

//서브공지데이터 요청
app.get("/subnotice", async (req, res) => {
    conn.query(`select * from notice where not_no limit 0, 3`, 
    (err, result, fields) => {
        if(result){
            console.log(result);
            res.send(result);
        }
    })
})

//서브리뷰데이터 요청
app.get("/subrevs", async (req, res) => {
    conn.query(`select * from review where r_no limit 0, 3`, 
    (err, result, fields) => {
        if(result){
            console.log(result);
            res.send(result);
        }
    })
})

//자유게시판 데이터 요청
app.get("/textFree", async (req, res) => {
    conn.query(`select * from board order by bor_no desc`,
     (err, result, fields)=>{
        if(result){
            console.log(result);
            res.send(result)
        }
        console.log(err)
     })
})

//서브자유게시판 데이터 요청
app.get("/subFrees", async (req, res) => {
    conn.query(`select * from board where bor_no limit 0, 3`,    
     (err, result, fields)=>{
        if(result){
            console.log(result);
            res.send(result)
        }
        console.log(err)
     })
})

//자유게시판 수정
app.patch("/editFree", async (req, res)=> {
    const {t_title, t_nickname, t_date, t_desc, t_no} = req.body
    conn.query(`update board set bor_title = '${t_title}', bor_name = '${t_nickname}', bor_date = '${t_date}', bor_desc = '${t_desc}' where bor_no = '${t_no}'`,
    (err, result, fields)=> {
        if(result) {
            res.send("등록되었습니다")
            console.log(result)
        }
        console.log(err)
    })
})

//자유게시판 삭제
app.delete("/deleteFree/:no", async (req, res)=> {
    const {no} = req.params
    conn.query(`delete from board where bor_no = '${no}'`,
    (err, result, fields)=> {
        if(result) {
            res.send("삭제되었습니다")
            console.log(result)
        }
        console.log(err)
    })
})




//id 중복확인
app.post("/idch", async (req, res)=>{
    const {id} = req.body;
    console.log(id)
    conn.query(`select * from members where id ='${id}'`,
    (err, result, fields)=>{
        if(result){
            console.log(result)
            res.send(result[0])
        }
        console.log(err)
    })
})


//닉네임 중복확인
app.post("/nicname", async (req, res)=>{
    const {nicname} = req.body;
    console.log(nicname)
    conn.query(`select * from members where nicname ='${nicname}'`,
    (err, result, fields)=>{
        if(result){
            console.log(result)
            res.send(result[0])
        }
        console.log(err);
    })
})

//회원가입 요청
app.post("/join", async (req, res)=> {
    const mytextpass = req.body.password;
    let myPass = "";
    //console.log(res)
    const {id, username , nicname, password, year, month, day, email1, email2, gender} = req.body;
    console.log(req.body)
    if(mytextpass != '' && mytextpass != undefined) {
        bcrypt.genSalt(saltRounds, function(err, salt){
            bcrypt.hash(mytextpass, salt, function(err, hash){
                myPass = hash;
                conn.query(`insert into members(id,username, nicname, password, date, email1, gender) values('${id}','${username}','${nicname}','${myPass}','${year}${month}${day}','${email1}@${email2}','${gender}')`
                ,(err,result,fields)=>{
                    console.log(result)
                    if(result) {
                        console.log("성공")
                        res.send("등록되었습니다")
                    }
                    console.log(err)
                })
            })
        })
    }
    
})

//로그인 요청
app.post('/login', async (req, res)=>{
    //console.log(req.body)
    const {userid, userpassword} = req.body;
    conn.query(`select * from members where id = '${userid}'`,
    (err, result, fields)=> {
        console.log(result)
        if(result != undefined && result[0] != undefined) {
            bcrypt.compare(userpassword, result[0].password, function(err,newPassword){
                console.log(newPassword)
                console.log(userpassword)
                if(newPassword) {
                    console.log("로그인 성공")
                    //console.log(result)
                    res.send(result)
                }else {
                    //console.log(result)
                    console.log("로그인 실패")
                }
            })
        }else {
            console.log('데이터가 없습니다.')
        }
        
    })
})

//아이디찾기
app.post("/findid", async (req, res)=>{
    const {username, useremail} = req.body;
    conn.query(`select * from members where username= '${username}' and email1 = '${useremail}'`,
    (err, result, fields)=>{
        if(result){
            console.log("아이디찾기성공")
            res.send(result[0].id);
        }
        console.log(err)
    })
})

//비밀번호 찾기
app.post("/findpass", async (req, res)=>{
    const {username, userid, useremail} = req.body
    conn.query(`select * from members where username = '${username}' and email1 = '${useremail}' and id = '${userid}'`,
    (err, result, fields)=>{
        if(result) {
            console.log(result)
            res.send(result[0].id);
        }
        console.log(err)
    })
})

//비밀번호 변경 요청
app.patch('/editpass', async (req, res) => {
    const {password, email} = req.body
    const mytextpass = password
    console.log(password, email)
    let myPass = ''
    if(mytextpass !='' && mytextpass != undefined) {
        bcrypt.genSalt(saltRounds, function(err, salt){
            bcrypt.hash(mytextpass, salt, function(err, hash){
                myPass = hash;
                conn.query(`update members set password = '${myPass}' where id = '${email}'`,
                (err, result,fields)=>{
                    if(result){
                        res.send("등록되었습니다")
                        console.log(result)
                    }
                    console.log(err)
                })
            })
        })
    }
})

// 영화등록 요청
app.post(`/recomend`, async (req, res) => {
    const {mov_title, mov_genre, mov_limit, mov_date, mov_runnigtime,
    mov_actor, mov_director, mov_country, mov_score, mov_desc,
    mov_img, mov_movelink, mov_reco} = req.body;
    // 쿼리문
    conn.query(`insert into movie(mov_title, mov_genre, mov_limit, mov_date, mov_runnigtime,
        mov_actor, mov_director, mov_country, mov_score, mov_desc,
        mov_img, mov_movelink, mov_reco) values(?,?,?,?,?,?,?,?,?,?,?,?,?)`, [mov_title, mov_genre, mov_limit, 
        mov_date, mov_runnigtime, mov_actor, mov_director, mov_country, mov_score, mov_desc,
        mov_img, mov_movelink, mov_reco], (err, result, fields) => {
            if(result) {
                res.send('OK');
            }else {
                console.log(err);
            }
        });
})

// 한줄평 데이터 등록 요청
app.post(`/commend`, async (req, res) => {
    const {c_name, c_desc, c_movno, c_isDone} = req.body;
    // 쿼리문 
    conn.query(`insert into commend(c_name, c_desc, c_movno, c_isDone) values(?,?,?,?)`,[c_name, c_desc, c_movno, c_isDone],
    (err, result, fields) => {
        if(result) {
            res.send('OK');

        }else {
            console.log(err);
        }
    })
})
// 한줄평 데이터 요청
app.get(`/detailcommend/:no`, async (req, res) => {
    const {no} = req.params;
    conn.query(`select * from commend where c_movno='${no}' order by c_no desc`, (err, result, fields) => {
        if(result) {
            console.log('완료');
            res.send(result);
        }else {
            console.log(err);
        }
    })
})

//한줄평 데이터 수정 데이터 하나 요청
app.get('/getEditCommend/:id', async (req, res) => {
    const {id} = req.params;
    conn.query(`select * from commend where c_no = '${id}'`,
     (err, result, fields) => {
        if(result) {
            console.log(result)
            res.send(result)
        }
        console.log(err)
     })
})

//한줄평 데이터 수정 요청
app.patch('/setEdit', async (req, res) => {
    const {isDesc, isNo} = req.body;
    conn.query(`update commend set c_desc = '${isDesc}' where c_no = '${isNo}'`,
     (err, result, fields) => {
        if(result) {
            console.log(result)
            res.send(result)
        }
        console.log(err)
     })
})

//conn.query(`update notice set not_title = '${n_title}', not_name = '${n_nickname}', not_date = '${n_date}', not_desc = '${n_desc}' where not_no = '${n_no}'`,

// 추천 카운트 데이터 요청
app.get(`/recocount/:no`, async (req, res) => {
    const { no } = req.params;
    conn.query(`select * from recommend where reco_movno=${no}`,
    (err, result, fields) => {
        if(result) {
            // console.log(result);
            res.send(result);
        }else {
            res.send("ok");
        }
    })
})
//카운트 데이터 업데이트 요청
app.post('/counterUpdate', async (req, res) => {
    const {reco_usreid,reco_movno} = req.body;
    console.log(reco_movno,reco_usreid);
    conn.query(`select reco_usreid from recommend where reco_movno=${reco_movno}`, (err, result, fields)=>{
        console.log(result);
        console.log(err);
        if(result.length > 0){
            if(result[0].reco_usreid.indexOf(reco_usreid) !== -1){
                console.log("이미 추천했습니다.");
                res.send("no");
            }else {
                const userids = result[0].reco_usreid+'*'+reco_usreid;
                console.log(userids);
                console.log("업데이트문 작성");
                //insert into recommend set reco_count = roco_count+1 where reco_movno=${reco_movno}
                conn.query(`update recommend set reco_count = recommend.reco_count+1, reco_usreid='${userids}' where reco_movno=${reco_movno}` ,(err, result, fields)=>{
                    console.log(result);
                    console.log(err);
                    res.send("ok");
                })
            }
        }else {
            console.log("입력해야합니다.")
            conn.query(`insert into recommend(reco_movno,reco_usreid,reco_count ) values('${reco_movno}','${reco_usreid}',1)` ,(err, result, fields)=>{
                console.log(result);
                console.log(err);
                res.send("ok");
            })
        }
    })
})

//한줄평 데이터 삭제요청
app.delete("/deleteCommend/:id", async (req, res)=>{
    const {id} = req.params
    conn.query(`delete from commend where c_no = ${id}`,
    (err, result, fields) => {
        if(result){
            res.send("삭제되었습니다.")
            console.log(result)
        }
        console.log(err)
    }
    )
})



app.listen(port, ()=>{
    console.log("서버가 동작하고 있습니다.")
})