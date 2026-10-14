import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './styles.css';
import {installButtonFeedback} from './buttonFeedback';
installButtonFeedback();
class ErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<div className="welcome"><h1>Let's reopen your space.</h1><p>Something interrupted the screen. Your saved data is still on this device.</p><button className="primary" onClick={()=>location.reload()}>Reload hima</button></div>:this.props.children;}}
createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App/></ErrorBoundary></React.StrictMode>);
