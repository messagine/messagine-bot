export const eventTypeEnum = {
  action: 'action',
  admin: 'admin',
  command: 'command',
  error: 'error',
  message: 'message',
};

export const messageTypeEnum = {
  animation: 'animation',
  contact: 'contact',
  document: 'document',
  editedMessage: 'edited_message',
  location: 'location',
  photo: 'photo',
  sticker: 'sticker',
  text: 'text',
  venue: 'venue',
  video: 'video',
  videoNote: 'video_note',
  voice: 'voice',
};

export const commandEnum = {
  about: 'about',
  cancelFind: 'cancel_find',
  exitChat: 'exit_chat',
  findChat: 'find_chat',
  help: 'help',
  setLanguage: 'set_language',
  start: 'start',
};

export const adminCommandEnum = {
  adminChat: 'admin_chat',
  ban: 'ban',
  detail: 'detail',
  unban: 'unban',
};

export const actionEnum = {
  allLanguages: 'all_languages',
  changeLanguage: 'change_language',
  deleteMessage: 'delete_message',
  exitChatSure: 'exit_chat_sure',
  sayHi: 'say_hi',
  userLeft: 'user_left',
  userReturned: 'user_returned',
};

export const userStateEnum = {
  chat: 'chat',
  idle: 'idle',
  lobby: 'lobby',
};
