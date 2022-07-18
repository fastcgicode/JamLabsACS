export async function GetAcsUsers(username) {
  const headers = new Headers();

  const options = {
    method: 'GET',
    headers: headers
  };

  return await fetch('/api/AcsInvites/'+username, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}