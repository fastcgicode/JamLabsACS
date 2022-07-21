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

export async function CallAvailable(username: string, name: string) {
  const headers = new Headers();

  const options = {
    method: 'GET',
    headers: headers
  };

  return await fetch('/api/UserInvites/' + username + '/' + name, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export async function CallUpdateUser(username: string, connectionId: string) {
  const headers = new Headers();

  const options = {
    method: 'GET',
    headers: headers
  };

  return await fetch('/api/UserInvites/update/' + username + '/' + connectionId, options)
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

  return await fetch('/api/UserInvites/' + username + '/' + name+ '/' + invitedUser+ '/' + groupId, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}