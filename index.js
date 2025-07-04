//button to clear out part mal if any issues;
//save button implementation done partially need to do feedback success and alert if needed.

const express = require('express');
const { Database } = require('@sqlitecloud/drivers');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const tblKey = process.env['tblKey']
const db = new Database('sqlitecloud://ci35rlwsnz.sqlite.cloud:8860/'+tblKey);
let htmlStr = 'Portion For Today:<br/>';
let htmlDatMal=""
let verseCounter=1;
let verseShowCounter=1;
let versepointer="";
let goBookInitialRowId=0;
let htmljquery='<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>';
let htmljqueryui='<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.14.1/jquery-ui.min.js"></script>';
let htmlcss='<link rel="stylesheet" href="https://code.jquery.com/ui/1.13.3/themes/smoothness/jquery-ui.css">';
let jsonResult=null;
function firstFunction() {
  return new Promise((resolve, reject) => {
      let y = 0
      setTimeout(() => {
        for (i=0; i<10; i++) {
           y++
        }
         console.log('Loop completed.')  
         resolve(y)
      }, 1500)
  })
}


async function mainappForHtmlServe(res)
{
  const result = await firstFunction();//add a delay
  res.send(htmlStr);
}


app.get('/updateMalParts', async (req, res) => {

    let malParts=(req.query.malParts);
    let vrspntr=(req.query.vrspntr);
    //console.log(malParts);
    vrspntrparts=vrspntr.split(";");
    //console.log(vrspntrparts);
    //const result1 = await firstFunction();//add a delay
    const result = await db.sql`
    USE DATABASE malGreekNew;`
    //db.sql(,);
    const result2=await db.sql(`update "greekengmal" set malmap ="${malParts}" where book ="${vrspntrparts[0]}" and chapter="${vrspntrparts[1]}" and verseNum="${vrspntrparts[2]}";`)
    //console.log(result2)
    res.end();
});

app.get('/clearVerse', async (req, res) => {
    verseCounter=1;
    res.redirect('/getVerse');
})

app.get('/prevVerse', async (req, res) => {
    verseCounter=verseCounter-2;
    if(verseCounter<1)
    verseCounter=1;
    res.redirect('/getVerse');
})

app.get('/', async (req, res) => {
    res.redirect('/getVerse');
})

app.get('/showVerse', async (req, res) => {

    //refer this https://jsfiddle.net/subinbabu_009/o9Lujbw4/22/ for implementation
        const result = await db.sql`
        USE DATABASE malGreekNew; 
            SELECT * FROM "greekengmal where malgrk is not null ";`
        //jsonResult=JSON.parse(result)
        jsonResult=result


    counter1=0;
    flag=0;

    })

app.get('/getBook', async (req, res) => 
    {
        booknum=1;
        if(req.query.goBook)
        {
            booknum=req.query.goBook;
        }
    const result = await db.sql`
        USE DATABASE malGreekNew; 
            SELECT ROWID,* FROM "greekengmal" where book like ${booknum} order by ROWID;`
        //jsonResult=JSON.parse(result)
        jsonResult=result
        //console.log(jsonResult);
        let htmlData='<html><head></head><body><h1>Book Verse(Praise The Lord)</h1><br/>'
        let tickImage='<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYzS13QnFjTNZKKtFJ0OU4zc-R4zKVm7XKkQ&amp;s" style="width: 2%;">'
      let   verseDetails=""
        let rowCounter=1;
          jsonResult.forEach(function(item) {
            if(rowCounter==1)
                goBookInitialRowId=item.rowid;
                rowCounter=rowCounter+1;
                verseDetails=item.chapter+";"+item.verseNum
            if(item.malmap!=null && item.malmap!="")
            {

            htmlData=htmlData+'<a href="/public/editVerse.html?goverse='+item.rowid+'" target="_blank">'+
            "UpdateMalVerse "+verseDetails+'</a>'+'<a href="malgreek?goverse='+item.rowid+'" target="_blank">'+
            "malGreek "+verseDetails+'</a>'+'<a href="getVerse?goverse='+item.rowid+'" target="_blank">'+
                    "GoVerse "+verseDetails+'</a>'+item.Mal+tickImage+'<br/>';
            }
            else
            {
                htmlData=htmlData+'<a href="/public/editVerse.html?goverse='+item.rowid+'" target="_blank">'+
            "UpdateMalVerse "+verseDetails+'</a>'+'<a href="malgreek?goverse='+item.rowid+'" target="_blank">'+
            "malGreek "+verseDetails+'</a>'+'<a href="getVerse?goverse='+item.rowid+'" target="_blank">'+
                        "GoVerse "+verseDetails+'</a>'+item.Mal+'<br/>';
            }
        })
        htmlData=htmlData+'</body></html>';
        htmlStr=htmlData;
        mainappForHtmlServe(res);
});


app.get('/getVerse', async (req, res) => {

    if(req.query.goverse) 
    {
        verseCounter = parseInt(req.query.goverse);
    }
    
        
    console.log("verseCounter="+verseCounter);
    if(verseCounter==1 || goBookInitialRowId>100)
    {
        const result = await db.sql`
        USE DATABASE malGreekNew; 
            SELECT * FROM "greekengmal";`
        //jsonResult=JSON.parse(result)
        jsonResult=result
        goBookInitialRowId=0;
    }

    counter1=0;
    flag=0;
    jsonResult.forEach(function(item) {

        //console.log(item)
        counter1=counter1+1;
        if(flag==1)
            return;
        if(counter1==verseCounter)
        {
            malVerse=item.Mal;
            grkVerse=item.OriginalV;
            grkVerseD=item.verse;
            grkVersewithNum="";
            malgrk=item.malmap;
            if(malgrk==null || malgrk=="")
                malgrk="mapping not done";

            versepointer=item.book+";"+item.chapter+";"+item.verseNum;
            verseSplit=malVerse.split(" ");
            spnData="";
            spnDatagrk="";
            wordIdCntr=0;
            for(i=0;i<verseSplit.length;i++)
                {
                    wordIdCntr=i+1;
                    spnData=spnData+'<span id=word'+wordIdCntr+'>'+verseSplit[i]+'</span> ';
                }
            verseSplit=grkVerse.split("|");
            verseSplitD=grkVerseD.split(";");

            for(i=0;i<verseSplit.length;i++)
                {
                    wordIdCntr=i+1;
                    if(verseSplit[i]!="")
                {
                   // console.log(verseSplit[i]);
                   // console.log(verseSplitD[i]) ;
                    indverse=verseSplitD[i].split("|");

                    grkVersewithNum=grkVersewithNum+'<span title="'+indverse[0]+'-'+indverse[2]+'">'+verseSplit[i]+'('+wordIdCntr+')|</span>';
                }
                }    
            spnDatagrk=grkVersewithNum+'<br/><br/><p id="greekD">'+grkVerseD+"</p>";
          //  console.log(spnDatagrk)
        htmlDatMal = spnData
        verseCounter=verseCounter+1;
            flag=1;
        }
    })
    //for (rec in jsonResult)
    //console.log(rec);



    let htmlStart='<html><head></head><body><h1>Mal Greek Parser(Praise The Lord)</h1><br/>click on top of word to slice<br/><a href="getVerse">Next Verse</a><br/><a href="prevVerse">Prev Verse</a><br/><a href="clearVerse">Clear Progress</a><br/>'
    htmlStart=htmlStart+'<a href="getBook?goBook=1">Go Book 1</a> <br/> <a href="getVerse?goverse=2">Go to RowId Verse 2</a>  <br/>'
    let htmlEnd='<script src="public/runscript.js"></script></body></html>'

    let htmlData='<p id="versePointer">#vrspointer</p><p id="malMap">#malMap</p><p id="greek" style="font-size: xx-large;font-weight: bold;"><button id="btntoggle">toggleDetails</button><br/>#grkVerse</p><p id="mal">#spnData</p><p id="malpart"></p><div id="saveResp"><button id="svemalgrk">save Part</button></div>';
    htmlData=htmlData.replace("#spnData",htmlDatMal);
    htmlData=htmlData.replace("#grkVerse",spnDatagrk);
    htmlData=htmlData.replace("#vrspointer",versepointer)
    htmlData=htmlData.replace("#malMap",malgrk);
    htmlStr=htmlStart+'<br/>'+htmlData+htmljquery+htmljqueryui+htmlcss+htmlEnd;
    mainappForHtmlServe(res);
});
app.use('/public', express.static(__dirname + '/public/'));

//editStart
app.get('/records', async (req, res) => {
    try {
        let verseId = 1
        if(req.query.goverse) 
            {
            verseId = parseInt(req.query.goverse);
            }
            verseId = verseId || 1;
        recId=verseId;
        const rows = await db.sql(`USE DATABASE malGreekNew;SELECT ROWID,* FROM "greekengmal" where ROWID =  ${recId};`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update record
    app.put('/records/:rowid', async (req, res) => {
        //console.log(req.body)
        //return;
        const { Mal } = req.body;
        if(req.body.Mal)
            updateMal=req.body.Mal;
        //console.log({Mal})
        //console.log(Mal)

        const { rowid } = req.params;
        console.log(rowid)
        //return;
        try {
            const result = await db.sql(`USE DATABASE malGreekNew;UPDATE greekengmal SET Mal='${updateMal}' WHERE ROWID = ${rowid};`);
            console.log(result)
            res.json({ updated: result.changes });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
// Close database connection on server shutdown
process.on('SIGINT', async () => {
    if (db) {
        await db.close();
        console.log('Database connection closed.');
    }
    process.exit(0);
});

// Function to generate HTML with Flexbox layout
const generateHtml = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Malayalam Greek Map</title>
  <style>
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      width: 100%;
    }
    .cell {
      padding: 3px;
      flex: 0 0 auto;
      border: 1px solid #ccc;
      background-color: #f0f0f0;
      white-space: nowrap; /* Prevents wrapping */
    }
  </style>
</head>
<body>
  ${data
    .map(
      (row) => `
    <div class="row">
      ${row
        .map(
          (cell) => `
      <div class="cell">${cell}</div>
      `
        )
        .join('')}
    </div>
  `
    )
    .join('')}
</body>
</html>
`;

app.get('/malgreek', async (req, res) => {
    let verseId = 1
    if(req.query.goverse) 
            {
            verseId = parseInt(req.query.goverse);
            }
            verseId = verseId || 1;
        recId=verseId;
        const rows = await db.sql(`USE DATABASE malGreekNew;SELECT ROWID,* FROM "greekengmal" where ROWID =  ${recId};`);
        greekV= rows[0].OriginalV;
        malgrk= rows[0].malmap;
        if(malgrk==null || malgrk=="")
        {
            res.status(404).send('No malgrk found for this verse');
            return;
        }
        malgrkArr=malgrk.split("|");
        greekVArr=greekV.split("|");
        outArray=[];
    twoDArr=[]
    twoDArr[0]=[]
    counter=0;
        let greekPart, greekPartNums, greekEq="";
        for (let i = 0; i < malgrkArr.length; i++) 
            {

                if(malgrkArr[i]=="")
                    break;
            greekPart=malgrkArr[i].split("#");
            greekPartNums=greekPart[1].split(",");
                console.log(greekPartNums)
            greekEq="";
            for(let j = 0; j < greekPartNums.length; j++) 
                {
                    greekPartNums[j] = greekPartNums[j].trim();
                greekEq=greekEq+" "+greekVArr[greekPartNums[j]-1];


                }
                outArray.push({
                        mal: greekPart[0].trim(),
                        greek: greekEq.trimStart()
                    });
                twoDArr[0][counter]=greekPart[0].trim()+"<br/> "+greekEq.trimStart();
                counter=counter+1;
        }
        res.status(200).send(generateHtml(twoDArr));
});