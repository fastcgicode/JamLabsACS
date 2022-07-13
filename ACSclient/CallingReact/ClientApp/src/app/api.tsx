export async function GetAcsUsers() {
  const headers = new Headers();

  const options = {
    method: 'GET',
    headers: headers
  };

  return await fetch('/api/AcsUsers', options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}