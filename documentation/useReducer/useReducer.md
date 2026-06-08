### React's useReducer

```ts
import { userReducer } from "react";
function reducer(state, action) {
  // ...
}

function MyComponent() {
  // returns state and the dispatch that lets you update the state to a different value and
  // trigger a re-render.
  const [state, dispatch] = useReducer(reducer, { age: 42 });

  function handleClick() {
    dispatch({ type: "incremented_age" });
  }
}
```

The dispatch function only updates the state variable for the next render. If you read the state variable after calling the dispatch function, you will still get the old value that was on the screen your call.

```jsx
import { useReducer } from "react";
// the reducer function
function reducer(state, action) {
  if (action.type === "incremented_age") {
    return {
      age: state.age + 1,
    };
  }
  throw Error("Unknown action");
}
// the jsx component
export default function Counter() {
  const [state, distpach] = useReducer(reducer, { age: 42 })

  // the onclick function
  const onClick = () => {
    dispatch({ type: 'incremented_age'})
  }

  // return component
  return (
    <>
      <button onClick={onClick}>
        Increment Age
      </button>
      <p>Hello! you are {state.age}.</p>
    </>
  );
}
```

Then you need to fill in the code that will calculate and return the next state

```ts
function reducer(state, action) {
  switch (action.type) {
    case 'incremented_age': {
      return {
        name: state.name,
        age: state.age + 1
      };
    }
    case 'changed_name': {
      return {
        name: action.nextName,
        age: state.age
      };
    }
  }
  throw Error('Unknown action: ' + action.type);
}
```

Actions can have any shape. By convention, it’s common to pass objects with a type property identifying the action. It should include the minimal necessary information that the reducer needs to compute the next state.

```ts
function Form(){
    const [state, dispatch] = useReducer(reducer, { name: 'Taylor', age: 42})

    function handleButtonClick(){
        dispatch({type: 'incremented_age'})
    }

    function handleInputChange(e) {
    dispatch({
      type: 'changed_name',
      nextName: e.target.value
    });
}
```

State is readonly you can't mutate like this

```ts
// don't like this
function reducer(state, action) {
  switch (action.type) {
    case 'incremented_age': {
        // 🚩 Don't mutate an object in state like this:
        state.age = state.age + 1;
        return state;
    }}}

function reducer(state, action) {
  switch (action.type) {
    case 'incremented_age': {
      // ✅ Instead, return a new object
      return {
        ...state,
        age: state.age + 1
      };
    }}}
```

Here is an exmple on how to approach

```tsx
import { useReducer } from 'react';

// 1. create the initial state
function createInitialState(username) {
  const initialTodos = [];
  for (let i = 0; i < 50; i++) {
    initialTodos.push({
      id: i,
      text: username + "'s task #" + (i + 1)
    });
  }
  return {
    draft: '',
    todos: initialTodos,
  };
}

// 2. Write the reducer function
function reducer(state, action) {
  switch (action.type) {
    case 'changed_draft': {
      return {
        // note the action is passed as an object. It has a key nextDraft
        draft: action.nextDraft,
        todos: state.todos,
      };
    };
    case 'added_todo': {
      return {
        draft: '',
        todos: [
            {
                id: state.todos.length,
                text: state.draft
            }, 
            ...state.todos
        ]
      }
    }
  }
  throw Error('Unknown action: ' + action.type);
}

// 3. Create the component
export default function TodoList({ username }) {
  const [state, dispatch] = useReducer(
    reducer,
    username,
    createInitialState
  );
  return (
    <>
      <input
        value={state.draft}
        onChange={e => {
          dispatch({
            type: 'changed_draft',
            nextDraft: e.target.value
          })
        }}
      />
      <button onClick={() => {
        dispatch({ type: 'added_todo' });
      }}>Add</button>
      <ul>
        {state.todos.map(item => (
          <li key={item.id}>
            {item.text}
          </li>
        ))}
      </ul>
    </>
  );
}
```

## EXAMPLE:

```jsx
import { useEffect, useReducer } from "react";

// Mock database function
const fetchMembersFromDB = async () => {
    const membersList = [
        { 
            id: 1, name: "Timothy", 
            email: "tt@example.com", 
            memberSince: "2024-05-26" 
        },
        { 
            id: 2, 
            name: "Johnny", 
            email: "tt@example.com", 
            memberSince: "2025-05-20" 
        },
        { 
            id: 3, 
            name: "Tylor", 
            email: "ty@example.com", 
            memberSince: "2025-04-12" 
        }
    ];

    return membersList;
};

// initial members state
const initialMembersState = {
    members: []
}

// reducer
// tip: figure out what parameters it should use.
const reducer = (state, action) => {
    switch(action.type){
        case 'fetched_members' : {
            return { members: action.members }
        }
        case 'added_member' : {
            return {
                members: [
                    {
                        id: state.members.length + 1,
                        name: action.name,
                        email: action.email,
                        memberSince: new Date()
                            .toISOString()
                            .split('T')[0]
                    },
                    ...state.members
                ]
            }
        }
        case 'updated_member' : {
            return {
                members: state.members.map((member) => {
                    if(member.id === action.id){
                        return {
                            ...member,
                            name: action.name,
                            email: action.email
                        }
                    }
                    return member;
                })
            }

        }
        case 'deleted_member' : {
            return {
                members: state.members.filter((member) => {
                    return member.id !== action.id
                })
            }
        }

        default: throw Error('Unknown action: ' + action.type)
    }
}

export const ExampleComponent = () => {

    // 1. Pass initialMembersState so state.mebers exists on the first render
    const [state, dispatch] = useReducer(reducer, initialMembersState)

    const fetchMembers = async () => {
        const fetched = await fetchMembersFromDB();

        // dispatch as action.members
        dispatch({type: 'fetched_members', members: fetched})
    }

    const addDummyMember = () => {
        // dispatch as action.*
        dispatch({
            type: 'added_member',
            name: "Dummy",
            email: "dd@example.com"
        })
    }

    const updateMember = (memberId) => {
        // dispatch as action.*
        dispatch({
            type: 'updated_member',
            id: memberId,
            name: "Updated",
            email: "ud@example.com"
        })
    }

    const deleteMember = (memberId) => {
        // dispatch as action.id
        dispatch({
            type: 'deleted_member',
            id: memberId
        })
    }

    // 2. trigger the fetch once the component mounts
    useEffect(() => {
        fetchMembers();
    }, [])

    return (
        <div>
            <button onClick={addDummyMember}>Add new member</button>
            <p><strong>Members List:</strong></p>
            <ul>
                {state.members.map((member) => (
                    <li key={member.id}>
                        {member.name} ({member.email})
                        Joined: {member.memberSince}
                        
                        <button onClick={updateMember(member.id)}>
                            Update
                        </button>
                        <button onClick={deleteMember(member.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
```
