var counter=1;
var partCounter=1;
$( function() {
    $( document ).tooltip();
   $('#greekD').slideToggle(1000);
   $('#btntoggle').click(function() {
       $('#greekD').slideToggle(1000);
     });
});
$("#svemalgrk").click(function(){
   vrsPointer=$("#versePointer").text();
   malParts="";
   malPart=$("#malpart").children("span");
   //alert(malPart.text())
   error="no";
   malPart.each(function(){
      if(error=="yes")
         return;
       //alert($(this).children("input").val())
      postion=$(this).children("input").val()
      if(postion=="")
         error="yes";
      malParts=malParts+$(this).text()+"#"+postion+"|";
   });
   if(error=="yes")
   {
      alert("Please fill in all the parts");
      return;
   }
   //alert(malParts);
   $.ajax({
     url: "updateMalParts",
     type: "get", //send it through get method
     data: { 
       malParts: malParts, 
       vrspntr: vrsPointer

     },
     success: function(response) {
       //Do Something
     },
     error: function(xhr) {
       alert("error in save please retry");
     }
   });
});
$("#mal").click(function(){
//alert("s");
//alert(event.target.id);
var targId=event.target.id;
var finalId=""
var targNum=targId.split("word");
//alert(targNum[1])
var versePart="";
var appended="Yes";
$('#mal').children().each(function () {
   // alert($(this).text());
    //alert($(this).attr("id"));
    //finalId=finalId+$(this).attr("id");
     //console.log("word"+counter);
    //console.log(targNum[1])
    appended="No";
    if(counter<=targNum[1])
    {

    versePart=versePart+$('#word'+counter).text()+" "
    $('#word'+counter).remove();
    counter=counter+1;
    }
    else
    {
     $('#malpart').append('<br><span id=part'+partCounter+'>'+versePart+'<input type=text id=grkPos'+partCounter+'></input>'+'</span>');
    partCounter=partCounter+1;
    appended="Yes";
    return(false);
    }

});
if(appended=="No")
{
 $('#malpart').append('<br><span id=part'+partCounter+'>'+versePart+'<input type=text id=grkPos'+partCounter+'></input>'+'</span>');
    partCounter=partCounter+1;
}
//alert(finalId);
});
