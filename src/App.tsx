import React, {useEffect, useState} from 'react';
import './App.css';
import {SampleUser, User, userBaseSchema, UserUpdate, userUpdateSchema} from "./User";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import {number, ZodIssue} from "zod";

function App() {
  //Faking stuff
  const [dbUser, setDbUser] = useState(SampleUser)
  async function getUserFromFakeAPI(){
    await new Promise(f => setTimeout(f, 1000));
    return dbUser;
  }

  async function getBrokenUserFromFakeAPi(){
    await new Promise(f => setTimeout(f, 1000));
    return {id: 123, name:"Jhonny", email: "Jhonny@Vegas.com", password: "MySecretPassword",favoriteColor:"Blue"};
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

    const [colorStr, setColorStr] = useState("black")


    const[zodIssues, setZodIssues] = useState<ZodIssue[]>([]);

    function validate () {
      const parseResult = userUpdateSchema.safeParse(updateUserData)
      if(parseResult.success){
        setZodIssues([]);
        setColorStr("black")
      }else {
        setZodIssues(parseResult.error.errors)
      }
    }

    useEffect(() => {
      validate()

    }, [updateUserData]);
    async function updateUser(){
      //check if User Valid
      const parseResult = userUpdateSchema.safeParse(updateUserData)

      if(parseResult.success){
        setZodIssues([]);
        setDbUser(updateUserData as User)

      }else {
        setColorStr("red")
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
        <form >
          <input value={userResult?.id} disabled={true} />
          <label>id</label>
          <br/><br/>
          {Object.entries(updateUserData).filter(([key,value], index) => {
            return key !== "id";
          }).map(([key,value]) =>(<>
                {typeof value === "string" &&(
                    <input type="text" value={value} onChange={(event) => setUpdateUserData(prev => {return {...prev, [key]: event.target.value}})} />
                )}
                {typeof value ==="number" &&(
                    <input type="number" value={value} onChange={(event) => setUpdateUserData(prev => {return {...prev, [key]: event.target.valueAsNumber}})} />
                )}
              <label>{key}</label>
              <br/>
              <div style={{whiteSpace:"pre-wrap",color:colorStr}}>{zodIssues.filter(issue => issue.path.some(p=> p===key))?.map(zi => " - "+ zi.message).join("\n")}</div>
              <br/>
        </>))}
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
