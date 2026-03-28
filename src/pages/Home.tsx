import { useContext, useMemo, lazy, Suspense, useEffect } from "react";
import {
  AddButton,
  GreetingHeader,
  Offline,
  ProgressPercentageContainer,
  StyledProgress,
  TaskCompletionText,
  TaskCountClose,
  TaskCountHeader,
  TaskCountTextContainer,
  TasksCount,
  TasksCountContainer,
} from "../styles";

import { Emoji } from "emoji-picker-react";
import { Box, Button, CircularProgress, Tooltip, Typography } from "@mui/material";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { AddRounded, CloseRounded, TodayRounded, UndoRounded, WifiOff } from "@mui/icons-material";
import { UserContext } from "../contexts/UserContext";
import { useResponsiveDisplay } from "../hooks/useResponsiveDisplay";
import { useNavigate } from "react-router-dom";
import { AnimatedGreeting } from "../components/AnimatedGreeting";
import { showToast } from "../utils";

const TasksList = lazy(() =>
  import("../components/tasks/TasksList").then((module) => ({ default: module.TasksList })),
);

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const { tasks, emojisStyle, settings, name } = user;

  const isOnline = useOnlineStatus();
  const n = useNavigate();
  const isMobile = useResponsiveDisplay();

  useEffect(() => {
    document.title = "TodoApp";
  }, []);

  // Calculate these values only when tasks change
  const taskStats = useMemo(() => {
    const completedCount = tasks.filter((task) => task.done).length;
    const completedPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    const today = new Date().setHours(0, 0, 0, 0);
    const dueTodayTasks = tasks.filter((task) => {
      if (task.deadline) {
        const taskDeadline = new Date(task.deadline).setHours(0, 0, 0, 0);
        return taskDeadline === today && !task.done;
      }
      return false;
    });

    const taskNamesDueToday = dueTodayTasks.map((task) => task.name);

    return {
      completedTasksCount: completedCount,
      completedTaskPercentage: completedPercentage,
      tasksWithDeadlineTodayCount: dueTodayTasks.length,
      tasksDueTodayNames: taskNamesDueToday,
    };
  }, [tasks]);

  // Memoize time-based greeting
  const timeGreeting = useMemo(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12 && currentHour >= 5) {
      return "좋은 아침이에요";
    } else if (currentHour < 18 && currentHour > 12) {
      return "좋은 오후예요";
    } else {
      return "좋은 저녁이에요";
    }
  }, []);

  // Memoize task completion text
  const taskCompletionText = useMemo(() => {
    const percentage = taskStats.completedTaskPercentage;
    switch (true) {
      case percentage === 0:
        return "아직 완료한 할 일이 없어요. 화이팅!";
      case percentage === 100:
        return "축하해요! 모든 할 일을 완료했어요! 🎉";
      case percentage >= 75:
        return "거의 다 왔어요!";
      case percentage >= 50:
        return "절반 완료! 계속 해봐요!";
      case percentage >= 25:
        return "잘 하고 있어요.";
      default:
        return "이제 시작이에요!";
    }
  }, [taskStats.completedTaskPercentage]);

  const updateShowProgressBar = (value: boolean) => {
    setUser((prevUser) => ({
      ...prevUser,
      settings: {
        ...prevUser.settings,
        showProgressBar: value,
      },
    }));
  };

  return (
    <>
      <GreetingHeader>
        <Emoji unified="1f44b" emojiStyle={emojisStyle} /> &nbsp; {timeGreeting}
        {name && (
          <span translate="no">
            , <span>{name}</span>
          </span>
        )}
      </GreetingHeader>

      <AnimatedGreeting />

      {!isOnline && (
        <Offline>
          <WifiOff /> 오프라인 상태예요. 앱은 계속 사용할 수 있어요!
        </Offline>
      )}
      {tasks.length > 0 && settings.showProgressBar && (
        <TasksCountContainer>
          <TasksCount glow={settings.enableGlow}>
            <TaskCountClose
              size="small"
              onClick={() => {
                updateShowProgressBar(false);
                showToast(
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    진행바가 숨겨졌어요. 설정에서 다시 켤 수 있어요.
                    <Button
                      variant="contained"
                      sx={{ p: "12px 32px" }}
                      onClick={() => updateShowProgressBar(true)}
                      startIcon={<UndoRounded />}
                    >
                      Undo
                    </Button>
                  </span>,
                );
              }}
            >
              <CloseRounded />
            </TaskCountClose>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <StyledProgress
                variant="determinate"
                value={taskStats.completedTaskPercentage}
                size={64}
                thickness={5}
                aria-label="Progress"
                glow={settings.enableGlow}
              />

              <ProgressPercentageContainer
                glow={settings.enableGlow && taskStats.completedTaskPercentage > 0}
              >
                <Typography
                  variant="caption"
                  component="div"
                  color="white"
                  sx={{ fontSize: "16px", fontWeight: 600 }}
                >{`${Math.round(taskStats.completedTaskPercentage)}%`}</Typography>
              </ProgressPercentageContainer>
            </Box>
            <TaskCountTextContainer>
              <TaskCountHeader>
                {taskStats.completedTasksCount === 0
                  ? `할 일이 ${tasks.length}개 있어요.`
                  : `${tasks.length}개 중 ${taskStats.completedTasksCount}개 완료했어요.`}
              </TaskCountHeader>
              <TaskCompletionText>{taskCompletionText}</TaskCompletionText>
              {taskStats.tasksWithDeadlineTodayCount > 0 && (
                <span
                  style={{
                    opacity: 0.8,
                    display: "inline-block",
                  }}
                >
                  <TodayRounded sx={{ fontSize: "20px", verticalAlign: "middle" }} />
                  &nbsp;오늘 마감:Tasks due today:&nbsp;nbsp;
                  <span translate="no">
                    {new Intl.ListFormat("ko", { style: "long" }).format(
                      taskStats.tasksDueTodayNames,
                    )}
                  </span>
                </span>
              )}
            </TaskCountTextContainer>
          </TasksCount>
        </TasksCountContainer>
      )}
      <Suspense
        fallback={
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        }
      >
        <TasksList />
      </Suspense>
      {!isMobile && (
        <Tooltip title={tasks.length > 0 ? "새 할 일 추가" : "할 일 추가"} placement="left">
          <AddButton
            animate={tasks.length === 0}
            glow={settings.enableGlow}
            onClick={() => n("add")}
            aria-label="할 일 추가"
          >
            <AddRounded style={{ fontSize: "44px" }} />
          </AddButton>
        </Tooltip>
      )}
    </>
  );
};

export default Home;
