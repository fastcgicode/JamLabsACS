export async function CallUserInvites() {
  const headers = new Headers();

  const options = {
    method: 'GET',
    headers: headers
  };

  return await fetch('/api/UserInvites', options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export async function CallAvailable(username: string, name: string, connectionId: string) {
  const headers = new Headers();

  const options = {
    method: 'GET',
    headers: headers
  };

  return await fetch('/api/UserInvites/available/' + username + '/' + name+ '/' + connectionId, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export async function CallUnavailable(username: string) {
  const headers = new Headers();

  const options = {
    method: 'GET',
    headers: headers
  };

  return await fetch('/api/UserInvites/' + username, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export async function CallInvite(username: string, name: string, invitedUser: string, groupId: string) {
  const headers = new Headers();

  const options = {
    method: 'GET',
    headers: headers
  };

  return await fetch('/api/UserInvites/' + username + '/' + name + '/' + invitedUser + '/' + groupId, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export async function CallUpdateInCall(username: string, isInCall: string) {
  const headers = new Headers();

  const options = {
    method: 'GET',
    headers: headers
  };

  return await fetch('/api/UserInvites/incall/' + username + '/' + isInCall, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}