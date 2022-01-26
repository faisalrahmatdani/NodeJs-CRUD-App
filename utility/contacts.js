const fs = require("fs");

const dirPath = "./data";
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

const dataPath = "./data/contact.json";
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, "[]", "utf-8");
}
const loadPath = () => {
  const filebuffer = fs.readFileSync("data/contact.json", "utf-8");
  const contact = JSON.parse(filebuffer);
  return contact;
};

// find detail contact
const findContact = (nama) => {
  const contacts = loadPath();
  const search = contacts.find((data) => data.nama.toLowerCase() === nama.toLowerCase());
  return search;
};

const saveContacts = (contacts) => {
  fs.writeFileSync("data/contact.json", JSON.stringify(contacts));
};

const addContact = (contact) => {
  const contacts = loadPath();
  contacts.push(contact);
  saveContacts(contacts);
};

const checkDuplikasi = (nama) => {
  const contacts = loadPath();
  return contacts.find((contact) => contact.nama == nama);
};

const deleteContact = (nama) => {
  const contacts = loadPath();
  const newData = contacts.filter((contact) => contact.nama !== nama);
  saveContacts(newData);
};

const updateContact = (newData) => {
  const contacts = loadPath();
  const filter = contacts.filter((contact) => contact.nama !== newData.oldNama);
  delete newData.oldNama;
  filter.push(newData);
  saveContacts(filter);
};

module.exports = { loadPath, findContact, addContact, checkDuplikasi, deleteContact, updateContact };
