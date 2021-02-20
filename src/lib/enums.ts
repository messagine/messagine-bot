export const eventTypeEnum = {
  action: 'action',
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

export const actionEnum = {
  allLanguages: 'all_languages',
  changeLanguage: 'change_language',
};

export const userStateEnum = {
  chat: 'chat',
  idle: 'idle',
  lobby: 'lobby',
};
