import json
import os
import sys

def clean_val(val):
    if isinstance(val, str):
        val = val.strip()
        # strip outer quotes if they exist
        if len(val) >= 2 and val.startswith('"') and val.endswith('"'):
            val = val[1:-1]
        elif len(val) >= 2 and val.startswith("'") and val.endswith("'"):
            val = val[1:-1]
        # unescape
        try:
            # Try to decode if it is a JSON string
            val = json.loads(f'"{val}"')
        except:
            pass
    return val

def clean_dict(d):
    if isinstance(d, dict):
        return {k: clean_dict(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [clean_dict(x) for x in d]
    else:
        return clean_val(d)

def format_jsonl_to_md(jsonl_path, output_md_path):
    print(f"Parsing: {jsonl_path}")
    steps = []
    if not os.path.exists(jsonl_path):
        print(f"File not found: {jsonl_path}")
        return

    with open(jsonl_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                try:
                    steps.append(json.loads(line))
                except Exception as e:
                    print(f"Error parsing line: {e}")

    md_content = []
    
    # Title containing the Conversation ID
    conv_id = os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(jsonl_path))))
    md_content.append(f"# Antigravity Chat History\n")
    md_content.append(f"**Conversation ID:** `{conv_id}`\n\n")
    
    i = 0
    while i < len(steps):
        step = steps[i]
        step_type = step.get("type")
        content = step.get("content", "").strip()
        
        if step_type == "USER_INPUT":
            md_content.append("\n---\n")
            md_content.append(f"## 👤 User\n\n{content}\n")
            i += 1
        elif step_type == "PLANNER_RESPONSE":
            md_content.append("\n---\n")
            if content:
                md_content.append(f"## 🤖 Antigravity (AI Assistant)\n\n{content}\n")
            else:
                md_content.append(f"## 🤖 Antigravity (AI Assistant)\n*(Thinking/Executing tools...)*\n")
            
            tool_calls = step.get("tool_calls", [])
            if tool_calls:
                md_content.append("\n### 🛠️ Tool Executions\n")
                num_calls = len(tool_calls)
                for call_idx, call in enumerate(tool_calls):
                    tool_name = call.get("name", "Unknown Tool")
                    args = call.get("args", {})
                    if isinstance(args, str):
                        try:
                            args = json.loads(args)
                        except:
                            pass
                    
                    args = clean_dict(args)
                    args_str = json.dumps(args, indent=2) if isinstance(args, (dict, list)) else str(args)
                    
                    md_content.append(f"<details>\n<summary>🔧 Call tool: <code>{tool_name}</code></summary>\n\n")
                    md_content.append(f"**Arguments:**\n```json\n{args_str}\n```\n\n")
                    
                    # Find the result step
                    result_step = None
                    lookahead = i + 1 + call_idx
                    if lookahead < len(steps):
                        candidate = steps[lookahead]
                        cand_type = candidate.get("type")
                        # If the candidate type represents a tool execution
                        if cand_type not in ["USER_INPUT", "PLANNER_RESPONSE", "CONVERSATION_HISTORY", "KNOWLEDGE_ARTIFACTS"]:
                            result_step = candidate
                    
                    if result_step:
                        res_content = result_step.get("content", "")
                        res_error = result_step.get("error", "")
                        if res_error:
                            md_content.append(f"**Error:**\n```\n{res_error}\n```\n")
                        else:
                            md_content.append(f"**Result:**\n```\n{res_content}\n```\n")
                    else:
                        md_content.append("*(No execution result logged or pending)*\n")
                    md_content.append("</details>\n\n")
                
                i += 1 + num_calls
            else:
                i += 1
        elif step_type in ["ERROR_MESSAGE", "SYSTEM_MESSAGE"]:
            error_val = step.get("error", "")
            msg = content or error_val
            md_content.append(f"\n> ⚠️ **System/Error Message ({step_type}):**\n> {msg}\n")
            i += 1
        else:
            i += 1
            
    with open(output_md_path, 'w', encoding='utf-8') as f:
        f.write("".join(md_content))
    print(f"Successfully exported to: {output_md_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python exporter.py <jsonl_path> <output_md_path>")
        sys.exit(1)
    format_jsonl_to_md(sys.argv[1], sys.argv[2])
