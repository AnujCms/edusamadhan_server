(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{590:function(e,t,a){"use strict";var r=a(40),n=a.n(r),o=a(52),s=a(15),i=a(12),c=a(185),l=a(16),d=a(186),p=a(0),m=a.n(p),u=a(126),h=(a(593),a(6041)),g=a(43),f=a.n(g),b=a(5949),w=a(246),x=a.n(w);t.a=function(){return function(e){return Object(u.a)(Object(b.a)(function(e){return function(t){function a(){var e,t;Object(s.a)(this,a);for(var r=arguments.length,i=new Array(r),d=0;d<r;d++)i[d]=arguments[d];return(t=Object(c.a)(this,(e=Object(l.a)(a)).call.apply(e,[this].concat(i)))).state={isError:!1},t.makeAuthenticatedAPICall=function(){var e=Object(o.a)(n.a.mark(function e(a,r,o){var s,i;return n.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.prev=1,e.next=4,f()({method:a,url:r,headers:{"x-access-token":localStorage.getItem("accessToken")},data:o});case 4:if(200!==(s=e.sent).status){e.next=9;break}return e.abrupt("return",s);case 9:t.setState({isError:!0});case 10:e.next=26;break;case 12:if(e.prev=12,e.t0=e.catch(1),!(e.t0.response.status=401)){e.next=25;break}return e.next=17,t.props.currentUser.refreshTokens();case 17:return e.next=19,f()({method:a,url:r,headers:{"x-access-token":localStorage.getItem("accessToken")},data:o});case 19:if(200!==(i=e.sent).status){e.next=24;break}return e.abrupt("return",i);case 24:t.setState({isError:!0});case 25:throw e.t0;case 26:e.next=32;break;case 28:e.prev=28,e.t1=e.catch(0),console.log("ERROR:",e.t1),t.setState({isError:!0});case 32:case"end":return e.stop()}},e,null,[[0,28],[1,12]])}));return function(t,a,r){return e.apply(this,arguments)}}(),t.getRedirectQueryString=function(e){var t={redirectTo:e};return"?".concat(x.a.stringify(t))},t}return Object(d.a)(a,t),Object(i.a)(a,[{key:"render",value:function(){var t=this.props.currentUser;return this.state.isError?m.a.createElement(h.a,{to:"/guest/login".concat(this.getRedirectQueryString(this.props.location.pathname))}):m.a.createElement(e,Object.assign({loggedInUserObj:t,authenticatedApiCall:this.makeAuthenticatedAPICall},this.props))}}]),a}(m.a.Component)}(e)))}}},6043:function(e,t,a){"use strict";a.r(t);var r=a(40),n=a.n(r),o=a(52),s=a(15),i=a(12),c=a(185),l=a(16),d=a(186),p=a(13),m=a(0),u=a.n(m),h=a(590),g=a(290),f=a(280),b=a(305),w=a(5),x=a(195),E=a.n(x),y=a(198),v=a.n(y),C=a(332),P=a(334),S=a(625),k=a(184),j=a(33),O=a(215),T=a(5948),A=a(122),B=a(123),I=a(120),N=a(235),z=a(23),H=a(182),F=a(5985),L=a(278),R=function(e){var t=e.field,a=e.form,r=(e.name,e.helperText),n=(e.error,e.checkboxProps),o=e.displayErrorMessage,s=void 0===o||o,i=Object(z.a)(e,["field","form","name","helperText","error","checkboxProps","displayErrorMessage"]),c=n||{},l=(c.checked,c.name,c.onChange),d=c.onBlur,p=Object(z.a)(c,["checked","name","onChange","onBlur"]),m=Object(k.e)(a.touched,t.name),h=Object(k.e)(a.errors,t.name);return u.a.createElement(u.a.Fragment,null,u.a.createElement(H.a,Object.assign({control:u.a.createElement(F.a,Object.assign({name:t.name,checked:t.value,onChange:function(e,r){a.setFieldValue(t.name,r),l&&l(e,r)},onBlur:function(e){a.setFieldTouched(t.name),d&&d(e)}},p))},i)),s?u.a.createElement(L.a,{error:Boolean(m&&h)},m&&h||r):r&&u.a.createElement(L.a,null," ",r," "))},U=function(e){function t(e){var a;Object(s.a)(this,t),(a=Object(c.a)(this,Object(l.a)(t).call(this,e))).handleSubmit=function(){var e=Object(o.a)(n.a.mark(function e(t,r){var o;return n.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return o=r.setSubmitting,e.next=3,a.props.authenticatedApiCall("post","/api/providerauthservice/changePassword",{password:t.password,cnfpassword:t.cnfpassword}).then(function(e){console.log("response",e),o(!1),1===e.data.status?(localStorage.removeItem("accessToken"),localStorage.removeItem("refreshToken"),a.setState({resetPassworSuccess:!1})):0===e.data.status&&a.setState({unauthenticated:!0})}).catch(function(e){a.setState({unauthenticated:!0}),o(!1),console.log(e)});case 3:case"end":return e.stop()}},e)}));return function(t,a){return e.apply(this,arguments)}}(),a.dismissDialog=function(){a.setState({resetPassworSuccess:!0}),a.props.history.replace("../login")},a.logout=Object(o.a)(n.a.mark(function e(){return n.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return localStorage.removeItem("__warningPopShownForSession"),localStorage.removeItem("getAccountId"),localStorage.removeItem("UserAuth"),localStorage.removeItem("UserObject"),e.next=6,a.props.authenticatedApiCall("get","/api/providerauthservice/signout",null).then(function(e){200==e.status&&a.props.history.push("/public")});case 6:case"end":return e.stop()}},e)})),a.handleFirstTimeLogin=function(){a.setState({unauthenticated:!1}),a.props.history.push("./guest")},a.handleShowPassword=function(){a.setState({password:"text",showPassword:!1})},a.handleHidePassword=function(){a.setState({password:"password",showPassword:!0})},a.handleShowConfPassword=function(){a.setState({confPassword:"text",showCnfPassword:!1})},a.handleHideConfPassword=function(){a.setState({confPassword:"password",showCnfPassword:!0})},a.handleTermCondition=Object(o.a)(n.a.mark(function e(){return n.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:window.open("../termAndCondition");case 1:case"end":return e.stop()}},e)})),a.handlePrivacyPolicy=function(){window.open("../privacyPolicy")};a.props.t;return a.formikValidation=Object(j.object)().shape({password:Object(j.string)().required("This fiels is required.").min(8,"Password must be 8 character log.").matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#_?&^+=-])[A-Za-z\d$@$!%*#_?&^+=-]{8,}$/,"Passqord condition."),cnfpassword:Object(j.string)().required("This fiels is required.").oneOf([Object(j.ref)("password")],"Confirm password is not matching.")}),a.state={resetPassworSuccess:!0,language:a.props.i18n.language,unauthenticated:!1,password:"password",showPassword:!0,confPassword:"password",showCnfPassword:!0},a}return Object(d.a)(t,e),Object(i.a)(t,[{key:"componentDidMount",value:function(){null!=localStorage.getItem("accessToken")&&null!=localStorage.getItem("refreshToken")||this.props.history.push("../login")}},{key:"render",value:function(){var e=this,t=this.props,a=t.classes,r=(t.t,[u.a.createElement(g.a,{className:a.errorBtn,onClick:this.handleFirstTimeLogin},"ok")]);return u.a.createElement("div",null,u.a.createElement(I.Helmet,null,u.a.createElement("title",null,"FirstTimeLogin")),u.a.createElement("div",{key:this.props.i18n.language},u.a.createElement(A.a,{style:{backgroundColor:"#fff",marginBottom:"25px"}},u.a.createElement(B.a,{lg:12,md:12,sm:12,xs:12},u.a.createElement("div",{className:a.login},this.state.resetPassworSuccess?u.a.createElement(k.c,{initialValues:Object(p.a)({password:"",cnfpassword:"",acceptTerms:!1,termCondition:!1},"acceptTerms",!1),onSubmit:this.handleSubmit,validationSchema:this.formikValidation},function(t){return u.a.createElement(k.b,null,u.a.createElement(f.a,{className:a.cardHeading},"First Time Reset Password."),u.a.createElement(k.a,{component:O.a,label:"Enter your New Password.",onChange:e.handleChange,name:"password",fullWidth:!0,variant:"filled",className:a.inputItem+" selectstyle",InputProps:{type:e.state.password,endAdornment:u.a.createElement(b.a,{position:"end"},e.state.showPassword?u.a.createElement(E.a,{onClick:e.handleShowPassword,className:a.icnColor}):u.a.createElement(v.a,{onClick:e.handleHidePassword,className:a.icnColor}))}}),u.a.createElement("p",null,"Password rules ",u.a.createElement("span",{style:{color:"rgba(65, 117, 5, 1)"}},"Password must be 8 character long.")," | ",u.a.createElement("span",{style:{color:"rgba(65, 117, 5, 1)"}})," | ",u.a.createElement("span",{style:{color:"rgba(65, 117, 5, 1)"}},"123")," | ",u.a.createElement("span",{style:{color:"rgba(65, 117, 5, 1)"}},"@!$%^*()")," | ",u.a.createElement("span",{style:{color:"rgba(65, 117, 5, 1)"}},"\u2260 email")),u.a.createElement(k.a,{component:O.a,label:"Confirm your password.",fullWidth:!0,name:"cnfpassword",variant:"filled",className:a.inputItem+" selectstyle",InputProps:{type:e.state.confPassword,endAdornment:u.a.createElement(b.a,{position:"end"},e.state.showCnfPassword?u.a.createElement(E.a,{onClick:e.handleShowConfPassword,className:a.icnColor}):u.a.createElement(v.a,{onClick:e.handleHideConfPassword,className:a.icnColor}))}}),u.a.createElement("div",null),u.a.createElement(k.a,{name:"acceptTerms",component:R,checkboxProps:{color:"secondary"},className:"firstLoginCheck",label:u.a.createElement("div",null,u.a.createElement("span",{className:a.fntSz_16},"Accept the"),u.a.createElement("button",{type:"button",className:a.TermsCondition,onClick:e.handleTermCondition},"Term&Condition"),"And",u.a.createElement("button",{type:"button",className:a.TermsCondition,onClick:e.handlePrivacyPolicy},"Policy Policy"))}),u.a.createElement("div",null,u.a.createElement("div",{style:{textAlign:"center",marginBottom:"30px"}}," ",u.a.createElement("br",null),u.a.createElement("br",null),u.a.createElement(g.a,{disabled:!t.values.acceptTerms,type:"submit",className:a.primaryBtn,size:"small"}," Confirm "))))}):u.a.createElement(C.a,{style:{boxShadow:"none"}},u.a.createElement(P.a,null,u.a.createElement(f.a,{className:a.LoginHeading},"Successfull."),u.a.createElement("br",null),u.a.createElement(f.a,{variant:"h4",color:"inherit",className:a.loginSuccess},"Your password has been updated successfully.")),u.a.createElement("br",null),u.a.createElement(S.a,{className:a.cardFooter},u.a.createElement(g.a,{className:a.primaryBtn,size:"small",onClick:this.dismissDialog},"Login"))))))),this.state.unauthenticated?u.a.createElement(N.a,{successButton:r,HeaderText:"Unauthentication",dismiss:this.handleFirstTimeLogin}):"")}}]),t}(u.a.Component);t.default=Object(T.a)()(Object(h.a)()(Object(w.a)(function(e){return{primaryBtn:{color:e.palette.text.textPrimaryColor,backgroundColor:e.palette.primary.main,border:"1px solid "+e.palette.border.primaryBorder,width:"50%",borderRadius:"25px",padding:"10px",marginTop:"-35px","&:hover":{backgroundColor:e.palette.hoverPrimaryColor.main,color:e.palette.text.hoverTextPrimaryColor,border:"1px solid "+e.palette.border.hoverPrimaryBorder}},errorBtn:{color:e.palette.text.textPrimaryColor,backgroundColor:e.palette.primary.main,border:"1px solid "+e.palette.border.primaryBorder,borderRadius:"50px",margin:"8px 0",textAlign:"right",padding:"6px 17px",fontWeight:"400",lineHeight:"1.42857143","&:hover":{backgroundColor:e.palette.hoverPrimaryColor.main,color:e.palette.text.hoverTextPrimaryColor,border:"1px solid "+e.palette.border.hoverPrimaryBorder}},TermsCondition:{color:"#1a8eeb",textDecoration:"underline",backgroundColor:"transparent",border:"none",textAlign:"left",cursor:"pointer",fontSize:"16px",padding:"1px 10px"},fntSz_16:{fontSize:"16px"},loginSuccess:{fontSize:"18px",fontWeight:"500",marginBottom:"15px"},login:Object(p.a)({width:"410px",marginLeft:"37%",marginTop:"11%"},e.breakpoints.down("md"),{marginLeft:0,paddingTop:"15px"}),padTop:{padding:"0 40px",paddingTop:"40%",color:"#fff"},clrWhite:{color:"#fff !important"},fntSze20:{fontSize:"18px !important"},LoginHeading:{fontSize:"30px !important",fontWeight:"900 !important",color:"rgba(0, 0, 102, 1) !important"},LoginSubHeading:{fontSize:"18px !important",color:"rgba(109, 111, 123, 1)  !important",textAlign:"left",lineHeight:"24px  !important"},cardFooter:{justifyContent:"flex-end",padding:0,margin:"30px 0 20px"},icnColor:{cursor:"pointer"},inputItem:Object(p.a)({width:"100%",marginBottom:"15px"},e.breakpoints.down("md"),{width:"90%"}),cardHeading:{paddingBottom:"10px",textAlign:"center",fontSize:"25px",color:"green"}}},{withTheme:!0})(U)))}}]);
//# sourceMappingURL=14.bfcf2e0c.chunk.js.map