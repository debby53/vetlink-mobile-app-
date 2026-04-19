import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class SupervisionScreen extends StatefulWidget {
  const SupervisionScreen({super.key});

  @override
  State<SupervisionScreen> createState() => _SupervisionScreenState();
}

class _SupervisionScreenState extends State<SupervisionScreen> {
  final _msgController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [
    {
      'sender': 'CAHW John Doe',
      'text': 'The goat has been in labor for 4 hours. No progress. I have given calcium, but no changes. Please advise.',
      'time': '10:02 AM',
      'isVet': false,
    }
  ];

  @override
  void dispose() {
    _msgController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _msgController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({
        'sender': 'You (Dr)',
        'text': text,
        'time': 'Now',
        'isVet': true,
      });
      _msgController.clear();
    });
    
    // Auto-reply mock
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _messages.add({
            'sender': 'CAHW John Doe',
            'text': 'Understood. I will attempt repositioning as instructed. Thank you Dr.',
            'time': 'Now',
             'isVet': false,
          });
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Supervision: CAHW John')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            color: AppColors.accent.withValues(alpha: 0.1),
            child: Row(
              children: const [
                Icon(Icons.info_outline, color: AppColors.accent),
                SizedBox(width: 8),
                Expanded(child: Text('Case: Complex delivery - Goat. Awaiting your instructions.', style: TextStyle(fontWeight: FontWeight.w500))),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final  msg = _messages[index];
                final isVet = msg['isVet'] as bool;

                return Align(
                  alignment: isVet ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isVet ? AppColors.primary : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: isVet ? null : Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          msg['sender'],
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isVet ? Colors.white70 : AppColors.textMuted
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          msg['text'],
                          style: TextStyle(color: isVet ? Colors.white : AppColors.textMain, fontSize: 16),
                        ),
                        const SizedBox(height: 4),
                         Text(
                          msg['time'],
                          style: TextStyle(
                            fontSize: 10,
                            color: isVet ? Colors.white54 : AppColors.textMuted
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgController,
                    decoration: InputDecoration(
                      hintText: 'Type instructions...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                      filled: true,
                      fillColor: AppColors.background,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: AppColors.primary,
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white),
                    onPressed: _sendMessage,
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
