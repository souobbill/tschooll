import React, { useEffect } from 'react';
import './assets/css/global.css';
import './assets/css/custom.css';
import background from './assets/images/bg.jpg';
import vector from './assets/images/logo.png';
import fb from './assets/images/facebook.png';
import { Button } from 'antd'
import go from './assets/images/google.png';
import { useHistory } from 'react-router-dom'
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import { googleSignIn, getTeacherProfile } from '../../services/Teacher'

function Login() {

  const history = useHistory();

  const _onGoogleSignIn = (data) => {
    googleSignIn(data.tokenObj.id_token)
      .then(user => {
        if (user) {
          getTeacherProfile(data.profileObj.email).then(data => {
            localStorage.setItem('user', JSON.stringify(data));
            if (localStorage.getItem("email")) {
              let mail = JSON.parse(localStorage.getItem("email"));
              if (mail)
                if (mail != data.externalEmail) {
                  localStorage.removeItem('tenant'+data.id);
                }
            }
            if(!JSON.parse(localStorage.getItem("advanceSchedule" + data.id)))
              localStorage.setItem("advanceSchedule" + data.id, JSON.stringify(false));
            // if (data.tenants) {
            //   if (data.tenants.length > 0) {
                // if (localStorage.getItem("tenant"+data.id)) {
                //   if (data.tenants.filter(t => t.key == localStorage.getItem("tenant"+data.id)).length == 0) {
                //     localStorage.setItem('tenant'+data.id, JSON.stringify(data.tenants[0].tenant.key))
                //   } else {
                //     localStorage.setItem('tenant'+data.id, JSON.stringify(data.tenants[0].tenant.key))
                //   }
                // } else {
                //   localStorage.setItem('tenant'+data.id, JSON.stringify(data.tenants[0].tenant.key))
                // }
            //  } 
            //   else {
            //     localStorage.removeItem('tenant'+data.id);
            //   }
            // } else {
            //   localStorage.removeItem('tenant'+data.id);
            // }
            localStorage.setItem('email', JSON.stringify(data.externalEmail));
            localStorage.setItem('id', JSON.stringify(data.id));
            history.push(`/teacherlist`);
          });
        } else {
          alert('your account is not registered in the system');
        }
      })
      .catch(apiError => {
        console.log(apiError)
        alert('your account is not registered in the system');
      });
  }

  useEffect(() => {
    document.body.classList.add("img-bg");
    document.body.classList.add("min-height-full");
    if (window.location.pathname == '/login') {
      document.body.style.backgroundImage = `url(${background})`;
      document.getElementById('root').style.height = '100%';
      document.getElementsByClassName('ant-layout')[0].style.height = '100%';
      document.getElementsByClassName('childLayout')[0].style.background = 'rgba(255, 255, 255, 0)';
      document.getElementsByClassName('ant-layout')[0].style.background = 'rgba(255, 255, 255, 0)';
      document.getElementsByClassName('ant-layout')[1].style.height = '100%';
      document.getElementsByClassName('content-div')[0].style.height = '100%';
      document.getElementsByClassName('content-div')[0].style.backgroundColor = 'rgba(255, 255, 255, 0)';
    }
  }, []);

  return (
    <section className="wrapper" style={{ height: '100%' }}>
      <header className="header" style={{ height: '100%' }}>
        <a className="header-logo" href=""><img src={vector} alt="" /></a>
      </header>
      <article className="loginBox min-height-full" style={{ height: '100%' }}>
        <div className="loginBox__inner">
          <h1 className="loginBox__title">Appui Scolaire de la Reussite</h1>
          <div className="loginBox__btn-wrapper" style={{ height: '100%' }}>
            <GoogleLogin
              clientId="631785752296-26dcjnpcnjma16s630fcvhivhi8qsdg6.apps.googleusercontent.com"
              buttonText="Sign in with Google"
              render={renderProps => (
                <Button onClick={renderProps.onClick} disabled={renderProps.disabled} className="loginBox__btn" style={{ height: 'auto' }}><img src={go} alt="" /><span>Sign in with Google</span></Button>
              )}
              onSuccess={(data) => _onGoogleSignIn(data)}
              onFailure={(error) => console.log('ERROR ==> ', error)}
              cookiePolicy={'single_host_origin'}
            />
            {/* <FacebookLogin
              appId="1088597931155576"
              autoLoad={false}
              buttonText="Sign in with Facebook"
              fields="name,email,picture"
              render={renderProps => (
                <Button onClick={renderProps.onClick} className="loginBox__btn" style={{ height: 'auto'}}><img src={fb} alt="" /><span>Sign in with Facebook</span></Button>
              )} */}
            {/* <Button onClick={() => console.log('click')} className="loginBox__btn" style={{ height: 'auto'}}><img src={go} alt="" /><span>Sign in with Google</span></Button> */}
            <button className="loginBox__btn"><img src={fb} alt="" /><span>Sign in with Facebook</span></button>
          </div>
        </div>
      </article>
      <footer className="footer">

        <div className="footer-copyright">
          <span>© 2013 - 2021 Aproresco</span>
          <a href="#">Terms and Services</a> |
            <a href="#">Privacy</a> |
            <a href="#">Contact Us</a>
        </div>
      </footer>
    </section>
  );
}

export default Login;