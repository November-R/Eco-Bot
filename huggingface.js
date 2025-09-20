import { InferenceClient } from '@huggingface/inference';
import dotenv from 'dotenv';
import { AutoTokenizer, AutoModelForCausalLM } from 'transformers';

dotenv.config();

const model = 'openai/gpt2';
const userArgument = process.argv[2];

const tokenizer = await AutoTokenizer.from_pretrained(model);
const modelInstance = await AutoModelForCausalLM.from_pretrained(model);

const input_ids = tokenizer.encode(userArgument, return_tensors='pt');
const chat_history_ids = modelInstance.generate(input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id);

const response = tokenizer.decode(chat_history_ids[0], skip_special_tokens=true);
console.log('Chatbot response:', response);
