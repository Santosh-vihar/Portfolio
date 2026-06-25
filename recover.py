import json
import os

transcript_path = r'C:\Users\Madhu\.gemini\antigravity\brain\2539e2f4-353e-4815-ab83-fc835cd64e34\.system_generated\logs\transcript_full.jsonl'
output_dir = r'D:\Portfolio'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'PLANNER_RESPONSE' and 'tool_calls' in data:
                for tc in data['tool_calls']:
                    if tc.get('name') == 'write_to_file':
                        args = tc.get('args', {})
                        target_file = args.get('TargetFile', '')
                        content = args.get('CodeContent', '')
                        if target_file.endswith('styles.css') and content:
                            with open(os.path.join(output_dir, 'styles.css'), 'w', encoding='utf-8') as out:
                                out.write(content)
                            print('Recovered styles.css')
                        elif target_file.endswith('main.js') and content:
                            with open(os.path.join(output_dir, 'main.js'), 'w', encoding='utf-8') as out:
                                out.write(content)
                            print('Recovered main.js')
                        elif target_file.endswith('README.md') and content:
                            with open(os.path.join(output_dir, 'README.md'), 'w', encoding='utf-8') as out:
                                out.write(content)
                            print('Recovered README.md')
        except Exception as e:
            pass
