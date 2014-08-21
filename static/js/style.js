/**
 * Created by 柏然 on 2014/8/21.
 */
window.qstyle={
  task:null,
  style:{
    bold:{
      font:'bold 30px 黑体',
      textColor:'#000'
    },
    title:{
      font:'bold 20px 黑体',
      x:100,
      w:1280
    },
    input:{
      onchange:function(e){
        answers.qb[this.data]=this.validText;
      },
      x:100,w:800,font:'25px 黑体',waterMarkColor:'red'
    },
    img:{
      w:300,h:400,y:0,visibility:0.5,
      onclick:function(){
        answers.qa=this.data;
        this.visibility=1;
        var btn=this.parent.parent.findCtrl('confirm');
        btn.enable=true;
        btn.text=this.data;
        this.siblings.forEach(function(s){if(s.src)s.visibility=0.5;})
      }
    },
    styImg:{
      x:250,w:300,h:200,visibility:0.5,
      onclick:function(){
        var p= this.parent.parent,btn;
        p.findCtrl('detail').src=this.src;
        btn=p.findCtrl('confirm');
        btn.enable=true;
        answers.qc=btn.text=this.data;
        this.visibility=1;
        this.siblings.forEach(function(s){s.visibility=0.5;});
      }
    }
  },
  des:'非常感谢您预订“瑷都定制”的产品，为了更好地了解您的需求，同时也为了做出更贴合您心意的定制产品，请您耐心地回答我们以下问题：',
  ontaskstrat:function(task){
    var p1=task.findCtrl('p1'),clock=new animations.SimpleClock(1,-200);
    clock.ontick=function(ov){
      p1.findCtrl('des').visibility=clock.t;
      p1.findCtrl('logo').y+=this.value-ov;
    };
    p1.clock=clock;
    clock.start();
    qstyle.task=task;
  },
  action:{
    qa:function(){
     var ani= animations.util.translate(qstyle.task.findCtrl('p1'),1.5,animations.TimingFunctions.quartEaseOut,-1300,-740);
      ani.start();
      var p2=qstyle.task.findCtrl('p2');
      animations.util.translate(p2,1.5,animations.TimingFunctions.sineEaseInOut,1280,-720).start();
    },
    qb:function(){
      qstyle.task.findCtrl('p2').animation._nclock.reverse();
      var p3=qstyle.task.findCtrl('p3'),ani= animations.util.pop(p3,1.5,animations.TimingFunctions.circEaseOut);
      ani._nclock.ontick=function(){
        this.parent.visibility=this.t;
      };
      ani.start()
    },
    qc:function(){
     if(!this.siblings.every(function(s){
       if(s instanceof controls.TextInput&&!s.validText)return !(s.waterMarkText= '亲，这里还没有写哦');
       return true;
      }))return;
      qstyle.task.findCtrl('p3').animation._nclock.reverse();
      var p4=qstyle.task.findCtrl('p4');
      p4.visibility=1;
      animations.util.verticalFlip(p4,1.5,Math.PI/2*3,animations.TimingFunctions.quartEaseInOut,p4.w/2,-1).start();
    },
    end:function(){
      alert(JSON.stringify(answers));
    }
  }
};
window.labels={
  qa:['纪念礼物','结婚','生日礼物'],
  qb:['您和TA（们）的关系是:','您最想和TA（们）说的一句话是','你们之间最记忆深刻的一件事是:','你们之间最记忆深刻的一件事是:','TA最喜欢的一样东西是','TA最喜欢的颜色是'],
  qc:['小清新','现代简洁','可爱卡通','韩系思密达','欧美国际范','复古风']
};
window.answers={
  qa:'',qb:{},qc:''
};