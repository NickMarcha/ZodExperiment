import React, {useState} from 'react';
import './App.css';
import {User, userBaseSchema, UserUpdate, userUpdateSchema} from "./User";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import {ZodIssue} from "zod";

function App() {
  //Faking stuff
  const [dbUser, setDbUser] = useState({id: 123, name: "Jhonny", email: "Jhonny@Vegas.com", password: "MySecret1Password!"})
  async function getUserFromFakeAPI(){
    await new Promise(f => setTimeout(f, 1000));
    return dbUser;
  }

  async function getBrokenUserFromFakeAPi(){
    await new Promise(f => setTimeout(f, 1000));
    return {id: 123, name:123, email: "Jhonny@Vegas.com", password: "MySecretPassword"};
  }




  //"Real" stuff

  //Fetch USer
  const [userResult, setUserResult] = useState<User|null>(null)
  const [fetchErrorString, setFetchErrorString] = useState<string>("")
  async function getUser(func: () => any){
    const userData = await func();
    const parseResult = userBaseSchema.safeParse(userData);
    if(parseResult.success){
      setUserResult(parseResult.data)
      setFetchErrorString("")
    } else {
      setUserResult(null)
      console.log("zod",parseResult)
      setFetchErrorString(parseResult.error.issues.map(i => JSON.stringify(i)).join(", "))
    }
  }
  function FetchExample (){
    if(userResult != null){
      return<><h4>Got result</h4>
        <p>{JSON.stringify(userResult)}</p></>
    }else {
      return <p>{fetchErrorString}</p>
    }
  }

  //UpdateUser


  function UpdateUserExample(){
    const [updateUserData, setUpdateUserData] = useState<UserUpdate>(null as unknown as UserUpdate);

    const[zodIssues, setZodIssues] = useState<ZodIssue[]>([]);
    async function updateUser(){
      //check if User Valid
      const parseResult = userUpdateSchema.safeParse(updateUserData)

      if(parseResult.success){
        setZodIssues([]);
        setDbUser(updateUserData as User)

      }else {

        setZodIssues(parseResult.error.errors)
      }
    }

    if(updateUserData== null){
      if(userResult){
        setUpdateUserData(userResult)
      }
      return <>No User to update</>
    }
    return(
        <>
        <form>
          <input value={userResult?.id} disabled={true} />
          <label>id</label>
          <br/><br/>
          <input typeof="text" value={updateUserData.name} onChange={(event) => setUpdateUserData(prev => {return {...prev, name: event.target.value}})} />
          <label>name</label>
          <br/>
          <div style={{whiteSpace:"pre-wrap"}}>{zodIssues.filter(issue => issue.path.some(p=> p==="name"))?.map(zi => " - "+ zi.message).join(",\n")}</div>
          <br/>

          <input typeof="text" value={updateUserData.email} onChange={(event) => setUpdateUserData(prev => {return {...prev, email: event.target.value}})} />
          <label>email</label>
          <br/>
          <div style={{whiteSpace:"pre-wrap"}}>{zodIssues.filter(issue => issue.path.some(p=> p==="email"))?.map(zi => " - "+ zi.message).join(",\n")}</div>
          <br/>

          <input typeof="text" value={updateUserData.password} onChange={(event) => setUpdateUserData(prev => {return {...prev, password: event.target.value}})} />
          <label>password</label>
          <br/>
          <div style={{whiteSpace:"pre-wrap"}}>{zodIssues.filter(issue => issue.path.some(p=> p==="password"))?.map(zi => " - "+ zi.message).join(",\n")}</div>
          <br/>

        </form>
          <button onClick={() => updateUser()}> Update</button>
        </>
    )
  }
  return (
    <div className="App">

      <h1>Fetch</h1>
      <button onClick={()=>getUser(getUserFromFakeAPI)}>Get User</button>
      <button onClick={()=>getUser(getBrokenUserFromFakeAPi)}>Get Broken User</button>
      <FetchExample/>
      <h1>Update User</h1>
      <UpdateUserExample/>


    </div>
  );
}

export default App;
