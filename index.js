//button to clear out part mal if any issues;
//save button implementation done partially need to do feedback success and alert if needed.

const express = require('express');
const { Database } = require('@sqlitecloud/drivers');

const app = express();
const tblKey = process.env['tblKey']
const db = new Database('sqlitecloud://ci35rlwsnz.sqlite.cloud:8860/'+tblKey);
let htmlStr = 'Protion For Today:<br/>';
let htmlDatMal=""
let verseCounter=1;
let versepointer="";
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
    const result2=await db.sql(`update "greekengmal" set malgrk ="${malParts}" where book ="${vrspntrparts[0]}" and chapter="${vrspntrparts[1]}" and verseNum="${vrspntrparts[2]}";`)
    console.log(result2)
    res.end();
});

app.get('/clearVerse', async (req, res) => {
    verseCounter=1;
    res.redirect('/getVerse');
})

app.get('/getVerse', async (req, res) => {
    
    if(verseCounter==1)
    {
        const result = await db.sql`
        USE DATABASE malGreekNew; 
            SELECT * FROM "greekengmal";`
        //jsonResult=JSON.parse(result)
        jsonResult=result
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
            grkVerse=item.GreekV;
            grkVerseD=item.verse;
            grkVersewithNum="";
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



    let htmlStart='<html><head></head><body><h1>Mal Greek Parser(Praise The Lord)</h1><br/>click on top of word to slice<br/><a href="getVerse">Next Verse</a><br/><a href="clearVerse">Clear Progress</a><br/>'
    let htmlEnd='<script src="public/runscript.js"></script></body></html>'

    let htmlData='<p id="versePointer">#vrspointer</p><p id="greek" style="font-size: xx-large;font-weight: bold;"><button id="btntoggle">toggleDetails</button><br/>#grkVerse</p><p id="mal">#spnData</p><p id="malpart"></p><button id="svemalgrk">save Part</button>'
    htmlData=htmlData.replace("#spnData",htmlDatMal);
    htmlData=htmlData.replace("#grkVerse",spnDatagrk);
    htmlData=htmlData.replace("#vrspointer",versepointer)

    htmlStr=htmlStart+'<br/>'+htmlData+htmljquery+htmljqueryui+htmlcss+htmlEnd;
    mainappForHtmlServe(res);
});
app.use('/public', express.static(__dirname + '/public/'));
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
