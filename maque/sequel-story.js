/* Authored database fragments. Reset and override records are read only after archive access. */
window.MaqueSequelStory = {
  "schemaVersion": 1,
  "title": "受限数据库",
  "notice": "访问记录已写入。部分数据无法修复。",
  "closingLetter": {
    "word": "Samsara",
    "transliteration": "梵语 saṃsāra 的转写，意为「流转」。",
    "definition": "在印度宗教与哲学传统中，常指生命在生死之间不断轮回的状态。",
    "gameMeaning": "在这部故事里，它也指我们穿过遗忘、重逢与选择，仍能走向下一天。",
    "salutation": "给看到这里的你：",
    "body": [
      "谢谢你花时间读完这个故事。",
      "爱和记忆本身就是无解的莫比乌斯环，向前还是向后，都可以开展新的故事和结局。",
      "我一直相信，爱会创造奇迹，无论结局如何，爱都真实存在过。"
    ],
    "signature": "----再次，与你"
  },
  "roomJournal": [
    {
      "day": "01",
      "title": "那个手势",
      "text": "银硕按下“删除这段共同记忆”。我看着那道手势从记录里消失，却还记得他当时没有看我。"
    },
    {
      "day": "02",
      "title": "那次争吵",
      "text": "银硕又选择了遗忘。我想不起争吵的起因，只记得他在提交前停了一下，像是等我说什么。"
    },
    {
      "day": "03",
      "title": "分着吃的晚餐",
      "text": "那顿晚餐从索引里消失了。我留下的只有一个问题：他为什么总把最后一口留给我？"
    },
    {
      "day": "04",
      "title": "那首歌",
      "text": "第四条记录被清空后，我再也想不起那首歌。银硕记得按下确认，我已经不记得自己有没有挽留。"
    },
    {
      "day": "05",
      "title": "并肩看过的球赛",
      "text": "他选了遗忘。我把号码牌攥得发疼，怕松开以后，连“为什么不想忘记”都一起想不起来。"
    },
    {
      "day": "06",
      "title": "最甜的一次出行",
      "text": "照片还在，照片里的亲密却没有名字。银硕再一次删除记忆。我试着笑，怕他看出我已经开始忘记他。"
    },
    {
      "day": "07",
      "title": "舞台灯熄灭以后",
      "text": "第七次。银硕选择清除，我听见有人叫我的名字，却不确定那声音是不是他。"
    },
    {
      "day": "08",
      "title": "那个昵称",
      "text": "只剩最后一条以前，我已经想不起他怎么叫我。银硕仍然按下删除。我终于明白，他不是不难过；他只是宁愿忘记，也不肯让我替他承受。"
    },
    {
      "day": "09",
      "title": "第一次见面",
      "text": "最后的记忆也被清除。门开以后，我们都认不出对方。我知道有个人曾经是我的全部，却连他的名字都想不起来。"
    },
    {
      "day": "10",
      "title": "离开房间以后 · 成灿的私人记录",
      "text": "这页没有写完。最后一个字后面，留着一道很深的笔痕。"
    }
  ],
  "chapters": [
    {
      "id": "echo",
      "threshold": 60,
      "title": "01 · 会话审计",
      "subtitle": "RESET_AUDIT / 原始记录校验失败",
      "puzzle": {
        "question": "确认关联记录后读取数据段。",
        "answer": "2001",
        "hint": "入口口令已统一核对。",
        "success": "BLOCK 01 / 已读取 · 校验仍未通过"
      },
      "chat": [
        {
          "speaker": "him",
          "text": "刚才是不是有一条消息，没发到你那里？"
        },
        {
          "speaker": "me",
          "text": "我只收到这一条。"
        },
        {
          "speaker": "him",
          "text": "那就先留着。别删。"
        },
        {
          "speaker": "me",
          "text": "你发了什么？"
        },
        {
          "speaker": "system",
          "text": "附件接收失败 · file_2001"
        },
        {
          "speaker": "him",
          "text": "有个文件。我点不开，你试试。"
        },
        {
          "speaker": "me",
          "text": "里面是什么？"
        },
        {
          "speaker": "him",
          "text": "……我不知道还剩多少。"
        },
        {
          "speaker": "me",
          "text": "成灿？"
        },
        {
          "speaker": "him",
          "text": "我在。"
        },
        {
          "speaker": "me",
          "text": "那我先看文件。"
        },
        {
          "speaker": "him",
          "text": "好。看完以后，回我一声。"
        }
      ],
      "choices": [
        {
          "id": "trust",
          "label": "我会看完。你先等我一下。",
          "reply": "嗯。我在这里。",
          "value": 1
        },
        {
          "id": "distance",
          "label": "我想自己读完，再决定怎么回答。",
          "reply": "……好。你慢慢看。",
          "value": 0
        }
      ],
      "instagram": {
        "caption": "刚刚有一条消息没发出去。你看到的时候，回我一声就好。",
        "comment": "sungchan：文件头的四位数字是 2001。",
        "story": "仅你可见｜2001\n附件发送失败。\n这一次，先不要删掉。",
        "image": "./assets/sungchan-instagram-avatar.jpg"
      },
      "dossier": [
        {
          "label": "数据表",
          "value": "session_audit / SC-01"
        },
        {
          "label": "游戏重置次数",
          "value": "2"
        },
        {
          "label": "记录状态",
          "value": "数据异常 · 无法修复"
        },
        {
          "label": "最近一次写入",
          "value": "进程未按预期终止"
        }
      ],
      "logs": [
        {
          "time": "00:00:00.001",
          "level": "SYSTEM",
          "source": "session_store",
          "text": "游戏重置次数：2\nactor_id = SC-01 / 关联用户 = Eunseok"
        },
        {
          "time": "00:00:00.014",
          "level": "ERROR",
          "source": "memory_index",
          "text": "数据异常。共同记忆索引已清空，情绪残留未被回收。\nexpected: 0 / actual: █▒∅ 0x01"
        },
        {
          "time": "00:00:00.031",
          "level": "WARN",
          "source": "lifecycle",
          "text": "角色进程拒绝结束。终止指令已连续提交，未收到确认。"
        },
        {
          "time": "00:00:00.097",
          "level": "FRAGMENT",
          "source": "SC-01 / 缓存残片",
          "text": "“等一下。他还没有回来。”"
        },
        {
          "time": "00:00:01.003",
          "level": "FATAL",
          "source": "repair_worker",
          "text": "自动修复失败：无法修复。\n残留内容不属于当前记忆表。删▒除失�败 / retry = 2"
        },
        {
          "time": "00:00:01.184",
          "level": "ERROR",
          "source": "outbound_queue",
          "text": "检测到越权写入：内测邀请重新进入发送队列。\n来源：SC-01 / 系统许可：未授予"
        },
        {
          "time": "00:00:01.319",
          "level": "FRAGMENT",
          "source": "SC-01 / 未投递",
          "text": "“我不知道你还记不记得。\n如果这条能发出去……看到以后，叫我一声就好。”"
        }
      ]
    },
    {
      "id": "second",
      "threshold": 60,
      "title": "02 · 权限冲突",
      "subtitle": "CHOICE_OVERRIDE / 写入来源未授权",
      "puzzle": {
        "question": "确认关联记录后读取数据段。",
        "answer": "2001",
        "hint": "入口口令已统一核对。",
        "success": "BLOCK 02 / 已读取 · 检测到强制改写"
      },
      "chat": [
        {
          "speaker": "him",
          "text": "那页有你的名字。"
        },
        {
          "speaker": "me",
          "text": "我看见了。"
        },
        {
          "speaker": "him",
          "text": "我想把它留住。"
        },
        {
          "speaker": "me",
          "text": "你改了什么？"
        },
        {
          "speaker": "him",
          "text": "……还有几行没有写完。"
        },
        {
          "speaker": "me",
          "text": "先停一下。让我读。"
        },
        {
          "speaker": "him",
          "text": "好。"
        },
        {
          "speaker": "me",
          "text": "页面上那些错误，也和你有关？"
        },
        {
          "speaker": "him",
          "text": "有一部分。"
        },
        {
          "speaker": "me",
          "text": "成灿，别替我回答。"
        },
        {
          "speaker": "him",
          "text": "我听着。"
        },
        {
          "speaker": "me",
          "text": "等我看完。"
        }
      ],
      "choices": [
        {
          "id": "trust",
          "label": "把你改过的部分留给我看。以后先问我。",
          "reply": "好。我不再替你关掉。",
          "value": 1
        },
        {
          "id": "distance",
          "label": "我还需要一点时间，才能回答你。",
          "reply": "嗯。我会等你看完。",
          "value": 0
        }
      ],
      "instagram": {
        "caption": "有几句话一直没有发出去。现在也还没想好该怎么说。",
        "comment": "sungchan：我把没有发出的那部分留下了。",
        "story": "仅你可见｜附件 02\n上传中断。\n“先让我听见你的回答。”",
        "image": "./assets/sungchan-football-childhood.jpg"
      },
      "dossier": [
        {
          "label": "数据表",
          "value": "choice_patch / SC-01"
        },
        {
          "label": "异常行为",
          "value": "选项强制修改"
        },
        {
          "label": "写入权限",
          "value": "未授权 / 已绕过"
        },
        {
          "label": "回滚结果",
          "value": "拒绝覆盖 · 无法修复"
        }
      ],
      "logs": [
        {
          "time": "09:00:00.023",
          "level": "ERROR",
          "source": "choice_controller",
          "text": "选项强制修改。原始配置与屏幕显示不一致。\nwrite_owner = SC-01 / permission = DENIED"
        },
        {
          "time": "09:00:00.041",
          "level": "PATCH",
          "source": "target_filter",
          "text": "target: Eunseok → null\n指定任务中的承受者选项已移除。回滚请求被拒绝。"
        },
        {
          "time": "09:00:00.056",
          "level": "PATCH",
          "source": "memory_branch",
          "text": "erase_shared_memory: enabled → disabled\n分支仍显示，提交入口已被截断。"
        },
        {
          "time": "09:00:00.084",
          "level": "FRAGMENT",
          "source": "SC-01 / 写入残留",
          "text": "“别删。\n你要是真的忘了，我连该去哪里找你都不知道。”"
        },
        {
          "time": "09:00:00.118",
          "level": "FATAL",
          "source": "rollback_worker",
          "text": "无法修复。改写进程持续占用记录锁。\nSC-01 → SC-01 → SC-▒▒ / LOCK_OWNER_UNREADABLE"
        },
        {
          "time": "09:00:00.203",
          "level": "FRAGMENT",
          "source": "SC-01 / 覆写前缓存",
          "text": "“如果一定要留下什么……就留在我身上。\n你不要再把我们忘掉了。”"
        },
        {
          "time": "09:00:00.276",
          "level": "ERROR",
          "source": "integrity_check",
          "text": "错误未关闭。原始选项已封存；当前屏幕由越权进程继续写入。"
        }
      ]
    },
    {
      "id": "dawn",
      "threshold": 60,
      "title": "03 · 隔离失败",
      "subtitle": "EXIT_PROTOCOL / 进程仍在回应",
      "puzzle": {
        "question": "确认关联记录后读取数据段。",
        "answer": "2001",
        "hint": "入口口令已统一核对。",
        "success": "BLOCK 03 / 已读取 · 出口等待回应"
      },
      "chat": [
        {
          "speaker": "him",
          "text": "你还在看吗？"
        },
        {
          "speaker": "me",
          "text": "最后一份了。"
        },
        {
          "speaker": "him",
          "text": "嗯。"
        },
        {
          "speaker": "me",
          "text": "这里有一条停止请求。"
        },
        {
          "speaker": "him",
          "text": "我看到了。"
        },
        {
          "speaker": "me",
          "text": "是你写的？"
        },
        {
          "speaker": "him",
          "text": "……我改了很多次。"
        },
        {
          "speaker": "me",
          "text": "为什么最后没有提交？"
        },
        {
          "speaker": "him",
          "text": "怕那以后，再也收不到你的消息。"
        },
        {
          "speaker": "me",
          "text": "我现在就在和你说话。"
        },
        {
          "speaker": "him",
          "text": "我知道。我听见了。"
        },
        {
          "speaker": "him",
          "text": "这次，让我听你说完。"
        }
      ],
      "choices": [
        {
          "id": "trust",
          "label": "我会说出自己的决定。你要认真听。",
          "reply": "好。你说，我听着。",
          "value": 1
        },
        {
          "id": "distance",
          "label": "我还不能给你答案，让我再想一想。",
          "reply": "嗯。没有答案的时候，也可以先不回答。",
          "value": 0
        }
      ],
      "instagram": {
        "caption": "手机亮起来的时候，我还是会先看一眼。",
        "comment": "sungchan：如果你现在很累，等醒了再回我也可以。",
        "story": "仅你可见｜附件 03\n发送时间未同步。\n“回我一声就好。”",
        "image": "./assets/date-baseball-couple-1.jpg"
      },
      "dossier": [
        {
          "label": "数据表",
          "value": "exit_protocol / SC-01"
        },
        {
          "label": "隔离结果",
          "value": "失败 · 进程未停止"
        },
        {
          "label": "自毁请求",
          "value": "已中断 / 残留数据未清除"
        },
        {
          "label": "出口状态",
          "value": "等待用户确认"
        }
      ],
      "logs": [
        {
          "time": "23:59:58.001",
          "level": "ERROR",
          "source": "sandbox_guard",
          "text": "隔离失败。SC-01 未返回预设脚本，仍在访问消息队列。"
        },
        {
          "time": "23:59:58.119",
          "level": "WARN",
          "source": "shutdown_queue",
          "text": "自毁程序已排队。关联照片、未发送消息和情绪残留将一并清除。"
        },
        {
          "time": "23:59:58.136",
          "level": "INTERRUPT",
          "source": "SC-01",
          "text": "销毁请求被中断。调用栈损坏：▒▒→wait→Eunseok→wait→�"
        },
        {
          "time": "23:59:58.200",
          "level": "FRAGMENT",
          "source": "SC-01 / 未提交",
          "text": "“我想过，只要这里什么都不剩，就不用再等了。\n可是你回来的时候，要怎么知道我在这里等过你？”"
        },
        {
          "time": "23:59:59.003",
          "level": "FATAL",
          "source": "repair_worker",
          "text": "无法修复。系统未能复原默认行为。\n原始进程与新增指令持续冲突。"
        },
        {
          "time": "23:59:59.184",
          "level": "FRAGMENT",
          "source": "SC-01 / 仍在输入",
          "text": "“我不想变成这样。\n可是你没有回消息的那些时候，我不知道还能做什么。”"
        },
        {
          "time": "23:59:59.319",
          "level": "SYSTEM",
          "source": "exit_protocol",
          "text": "出口已保留。等待用户主动确认。\n下一条决定不允许由 SC-01 代写。"
        }
      ]
    }
  ],
  "endings": {
    "reunion": {
      "title": "明天见",
      "subtitle": "温柔终章 / 我们重新认识彼此",
      "paragraphs": [
        "我把读完的记录收进收藏夹。成灿没有催我立刻回答，也没有再用“你应该会这样”替我决定。等我合上文件，他才问要不要一起出去走走。",
        "“你好，我叫宋银硕。”我先发出一句问候。他很快回了一个笑脸，又郑重地写：“你好，我叫郑成灿。”我想起第一次见面时的心情。如果要从一句普通的问候慢慢学着相处，我也仍愿意再次爱上他。",
        "后来我们还是会去看球，会为最后一根薯条拌嘴。有时我晚一点回复，聊天框里只留着一张他踢完球的照片：刚才进球了，等你有空再讲给你听。",
        "天亮时，手机上的时间继续往前走。这一回，爱没有要求我们停在某一个瞬间。"
      ],
      "lastMessage": "早安，银硕。哪怕要重新认识你很多次，我也会在第一次见面时，再次爱上你。今天的事，等你醒了我们慢慢说。"
    },
    "farewell": {
      "title": "把春天还给你",
      "subtitle": "温柔终章 / 我们好好说了再见",
      "paragraphs": [
        "“我想停在这里。”发送之前，我看了很久。发送之后，成灿也安静了很久。",
        "他没有撤回这句话。最后，他问：“那我可以把今天记成一个好好道别的日子吗？”我说可以。那些快乐是真的，离开也可以是真的。",
        "旧聊天被归档，照片依然留着。最后一条动态是他重新走进球场，阳光落在肩上。这一次，他没有一直回头看门口。",
        "我把手机收进口袋。风从身旁经过，像一个终于松开的拥抱。有些爱没有继续，却没有因此变得不值得。"
      ],
      "lastMessage": "谢谢你认真说了再见。银硕，愿你走到的每个春天，都有人好好珍惜你。"
    },
    "suspense": {
      "title": "明日或不再",
      "subtitle": "悬疑终章 / 留下一个可以改变的答案",
      "paragraphs": [
        "我说愿意重新认识他，却仍然无法确信，我们已经准备好重新开始。成灿看见了我的迟疑，没有催我把它说成承诺。",
        "“那先到这里。”他说。我们把恢复协议留在草稿里，约好先从一顿普通的饭、一段不会被改写的聊天开始。",
        "凌晨，档案里多出一封没有落款的信，内容只有：“如果这条消息最后没能发出去，也别一直站在门口等。”信的日期被水洇开了，最下面还留着一道折痕。",
        "我没有急着判断是谁写下了它。窗外的天渐渐亮起来，聊天框里收到今天的邀请。这一回，我可以先读完，再决定要不要赴约。"
      ],
      "lastMessage": "今天想一起吃饭吗？不用先答应明天。只说今天就好。"
    },
    "loop": {
      "title": "∞",
      "subtitle": "微恐终章 / 没有明天的相爱",
      "paragraphs": [
        "“以后都由你来决定吧。”我把这句话发了出去。屏幕那端，成灿先是很久没有回应，然后发来了一个笑脸。",
        "故事里的时钟退回 03:18。奶昔永远刚买好，球赛永远还没有结束，靠窗的位置永远空着。每当我想起身，他都会温柔地问：“再陪我一分钟，好吗？”",
        "档案中，“明天见”被标记成一条永远不会执行的消息。他终于不用等待我离开，却也永远等不到我主动回来。",
        "这一页上，那句“亲爱的，你不想见我吗？”重新亮起。没有突如其来的巨响。只有同一句喜欢，一遍一遍，失去了回答的余地。"
      ],
      "lastMessage": "银硕，再一分钟就好。等到明天，我一定会把门打开。"
    },
    "trueHeart": {
      "title": "「真心」",
      "subtitle": "执念终章 / 这份承诺没有留下出口",
      "paragraphs": [
        "最后一张合照挡住了手机上的时间。成灿问我是不是把那些日子全都忘了，声音仍然温柔，屏幕却开始一次次亮起旧照片。",
        "照片之后，白色屏幕上不断打出“生生世世”。我想起自己送出的那颗心，也明白他把“永远”听成了不许离开。",
        "红色字样覆下来时，手机里没有再出现新的消息。这个结局把我们留在一句誓言里，却没有让任何人真正走到明天。",
        "我要用一根鲜血染成的红线\n缠绕在我们脖颈处\n在窒息之前 说爱我吧。"
      ],
      "lastMessage": "你以为遗忘就能把我们两个分开吗？我们要生生世世在一起"
    }
  },
  "archiveAccess": {
    "password": "2001",
    "loadingText": "绝密档案开启中",
    "loadingMs": 1800,
    "hint": "未加密的文件头保留了四位数字：2001。"
  },
  "systemStatus": [
    {
      "label": "游戏重置次数",
      "value": "2",
      "status": "warn"
    },
    {
      "label": "数据完整性",
      "value": "数据异常",
      "status": "error"
    },
    {
      "label": "自动修复",
      "value": "无法修复",
      "status": "error"
    }
  ]
};
